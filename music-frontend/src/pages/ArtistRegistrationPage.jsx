import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerArtistApi, getMyProfileApi } from '../utils/api';
import './ArtistRegistration.css'; 
import { 
    FaCheckCircle, 
    FaUpload, 
    FaMusic, 
    FaCreditCard, 
    FaLock, 
    FaUsers, 
    FaClock, 
    FaTimesCircle 
} from 'react-icons/fa';

const FEE_AMOUNT = 500000;

// ✅ Toast ở cuối màn hình
const Toast = ({ message, type }) => {
    if (!message) return null;
    return (
        <div className={`toast ${type}`}>
            {message}
        </div>
    );
};

const ArtistRegistrationPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stageName, setStageName] = useState(user?.username || '');
    const [formError, setFormError] = useState('');
    
    const [artistProfile, setArtistProfile] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        const checkArtistStatus = async () => {
            if (!isAuthenticated) return;
            try {
                const profile = await getMyProfileApi();
                if (profile.artist) {
                    setArtistProfile(profile.artist);
                }
            } catch (e) {
                // console.error(e);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkArtistStatus();
    }, [isAuthenticated]);

    const handleNext = () => {
        if (step === 2 && !agreed) {
            setFormError("Vui lòng đồng ý với Chính sách bản quyền để tiếp tục.");
            return;
        }
        if (step === 3 && !stageName.trim()) {
            setFormError("Vui lòng nhập Nghệ danh.");
            return;
        }
        setFormError('');
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleSubmitFinal = async () => {
        if (isSubmitting || !stageName.trim()) return;
        setIsSubmitting(true);
        setFormError('');
        try {
            await registerArtistApi(stageName.trim());
            setIsSubmitting(false);
            setToast({ message: "✅ Đăng ký thành công! Đang chuyển hướng về trang chủ...", type: 'success' });
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setIsSubmitting(false);
            setToast({ message: error.response?.data?.message || '❌ Đăng ký thất bại. Vui lòng thử lại.', type: 'error' });
        }
    };

    if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return null;
    }

    if (checkingStatus) {
        return <p className="loading-message">Đang kiểm tra trạng thái hồ sơ...</p>;
    }

    if (artistProfile) {
        const status = artistProfile.registrationStatus;
        let message = '';
        let icon = null;
        let color = '';

        if (status === 'APPROVED') {
            message = 'Hồ sơ Nghệ sĩ của bạn đã được duyệt và đang hoạt động.';
            icon = <FaCheckCircle size={80} color="var(--color-accent)" />;
            color = 'var(--color-accent)';
        } else if (status === 'PENDING') {
            message = 'Hồ sơ của bạn đang chờ Admin xem xét và duyệt.';
            icon = <FaClock size={80} color="var(--color-warning)" />;
            color = 'var(--color-warning)';
        } else if (status === 'REJECTED') {
            message = 'Rất tiếc, hồ sơ của bạn đã bị từ chối. Vui lòng liên hệ hỗ trợ.';
            icon = <FaTimesCircle size={80} color="var(--color-error)" />;
            color = 'var(--color-error)';
        }

        return (
            <div className="registration-container">
                <div className="registration-card">
                    <div className="status-icon">{icon}</div>
                    <h1 className="main-title" style={{ color }}>
                        Hồ sơ đã đăng ký ({status})
                    </h1>
                    <p className="step-description">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="registration-container">
            <div className="registration-card">
                <div className="step-indicator">
                    <span className={step >= 1 ? 'active' : ''}>1. Giới thiệu</span>
                    <span className={step >= 2 ? 'active' : ''}>2. Chính sách</span>
                    <span className={step >= 3 ? 'active' : ''}>3. Cam kết</span>
                    <span className={step >= 4 ? 'active' : ''}>4. Thanh toán</span>
                </div>
                
                <h1 className="main-title">Trở thành Nghệ sĩ</h1>
                {formError && <p className="error-message-general">{formError}</p>}

                {step === 1 && <StepOne handleNext={handleNext} />}
                {step === 2 && <StepTwo agreed={agreed} setAgreed={setAgreed} handleNext={handleNext} />}
                {step === 3 && <StepThree stageName={stageName} setStageName={setStageName} handleNext={handleNext} />}
                {step === 4 && (
                    <StepFour 
                        fee={FEE_AMOUNT} 
                        isSubmitting={isSubmitting} 
                        handleSubmitFinal={handleSubmitFinal}
                        stageName={stageName}
                    />
                )}

                {step > 1 && step < 4 && (
                    <button className="btn-back" onClick={() => setStep(prev => prev - 1)}>
                        Quay lại
                    </button>
                )}
            </div>

            {/* ✅ Toast thông báo ở cuối trang */}
            <Toast message={toast.message} type={toast.type} />
        </div>
    );
};

// COMPONENTS ================================

const FeatureCard = ({ icon, title, description }) => (
    <div className="feature-card">
        <div className="feature-icon">{icon}</div>
        <h4>{title}</h4>
        <p>{description}</p>
    </div>
);

const StepOne = ({ handleNext }) => {
    const { user } = useAuth();
    return (
        <>
            <h2 className="step-title">Chào mừng bạn, {user?.username}!</h2>
            <p className="step-description">
                Đăng ký hồ sơ Nghệ sĩ để bắt đầu quản lý và phát hành âm nhạc của bạn trên nền tảng Lame Music.
            </p>
            <div className="feature-grid">
                <FeatureCard icon={<FaUpload />} title="Tải nhạc độc quyền" description="Upload các ca khúc, singles, hoặc album của riêng bạn không giới hạn." />
                <FeatureCard icon={<FaMusic />} title="Quản lý Album" description="Tạo và quản lý các Album chuyên nghiệp, sắp xếp thứ tự bài hát." />
                <FeatureCard icon={<FaCheckCircle />} title="Kiếm tiền (Tương lai)" description="Hưởng lợi nhuận từ lượt stream (triển khai sau giai đoạn beta)." />
            </div>
            <button className="btn-next" onClick={handleNext}>Tiếp theo</button>
        </>
    );
};

const StepTwo = ({ agreed, setAgreed, handleNext }) => (
    <>
        <h2 className="step-title">Chính sách Bản quyền & Chất lượng</h2>
        <div className="policy-box">
            <p><strong>1.</strong> Tất cả nội dung tải lên phải thuộc quyền sở hữu/sáng tác của bạn.</p>
            <p><strong>2.</strong> File âm thanh phải đạt chuẩn tối thiểu 320kbps (MP3/FLAC).</p>
            <p><strong>3.</strong> Cấm nội dung bạo lực, phản cảm hoặc vi phạm pháp luật.</p>
            <p><strong>4.</strong> Lame Music có quyền khóa tài khoản nếu phát hiện vi phạm.</p>
        </div>
        <label className="checkbox-container">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
            Tôi đã đọc và đồng ý với các chính sách trên.
        </label>
        <button className="btn-next" onClick={handleNext} disabled={!agreed}>Tiếp theo</button>
    </>
);

const StepThree = ({ stageName, setStageName, handleNext }) => (
    <>
        <h2 className="step-title">Cam kết & Đăng ký Nghệ danh</h2>
        <p className="step-description">Vui lòng xác nhận Nghệ danh (Stage Name) cuối cùng của bạn.</p>
        <div className="policy-box commitment">
            <p><FaLock size={18} /> **Bảo mật:** Giữ an toàn thông tin cá nhân của bạn.</p>
            <p><FaUsers size={18} /> **Hỗ trợ:** Đội ngũ luôn sẵn sàng khi bạn cần.</p>
        </div>
        <div className="form-group stage-name-input">
            <label htmlFor="stageName">Nghệ danh (Stage Name):</label>
            <input
                type="text"
                id="stageName"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Ví dụ: Tên Thật Official"
                required
            />
        </div>
        <button className="btn-next" onClick={handleNext} disabled={!stageName.trim()}>
            Tiếp tục thanh toán
        </button>
    </>
);

const StepFour = ({ fee, isSubmitting, handleSubmitFinal, stageName }) => {
    const { user } = useAuth();
    return (
        <>
            <h2 className="step-title">Thanh toán Phí duy trì</h2>
            <p className="status-note" style={{ marginBottom: '20px' }}>
                Hồ sơ sẽ được gửi với <strong>Nghệ danh: {stageName}</strong>
            </p>
            <p className="step-description">
                Quét mã QR để thanh toán <strong>{fee.toLocaleString('vi-VN')} VND</strong>.
            </p>
            <div className="qr-code-section">
                <div className="qr-code-box">
                    <img src="/mock-qr.png" alt="QR Code" style={{ width: '200px' }} />
                    <p>Nội dung chuyển khoản: <strong>ARTIST-{user?.userId}</strong></p>
                </div>
            </div>
            <button className="btn-next" onClick={handleSubmitFinal} disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi hồ sơ...' : 'Hoàn tất & Chờ duyệt Admin'}
            </button>
        </>
    );
};

export default ArtistRegistrationPage;

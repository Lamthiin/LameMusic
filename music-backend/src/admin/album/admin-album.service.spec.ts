import { Test, TestingModule } from '@nestjs/testing';
import { AdminAlbumService } from './admin-album.service';

describe('AlbumService', () => {
  let service: AdminAlbumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminAlbumService],
    }).compile();

    service = module.get<AdminAlbumService>(AdminAlbumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AdminArtistService } from './admin-artist.service';

describe('AdminArtistService', () => {
  let service: AdminArtistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminArtistService],
    }).compile();

    service = module.get<AdminArtistService>(AdminArtistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

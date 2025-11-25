import { Test, TestingModule } from '@nestjs/testing';
import { AdminArtistController } from './artist.controller';

describe('AdminArtistController', () => {
  let controller: AdminArtistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminArtistController],
    }).compile();

    controller = module.get<AdminArtistController>(AdminArtistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

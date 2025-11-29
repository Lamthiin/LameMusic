import { Test, TestingModule } from '@nestjs/testing';
import { AdminAlbumController } from './album.controller';

describe('AdminAlbumController', () => {
  let controller: AdminAlbumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAlbumController],
    }).compile();

    controller = module.get<AdminAlbumController>(AdminAlbumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

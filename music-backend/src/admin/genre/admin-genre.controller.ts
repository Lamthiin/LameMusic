import { Controller, Get } from "@nestjs/common";
import { AdminGenreService } from "./admin-genre.service";

@Controller("admin/genres")
export class AdminGenreController {
  constructor(private readonly service: AdminGenreService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }
}

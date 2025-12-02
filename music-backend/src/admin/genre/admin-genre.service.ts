import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../category/category.entity";

@Injectable()
export class AdminGenreService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepo.find({
      order: { name: "ASC" }
    });
  }
}

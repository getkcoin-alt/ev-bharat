import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { Vehicle } from './vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private readonly repo: Repository<Vehicle>) {}

  list(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  async create(userId: string, dto: CreateVehicleDto) {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async update(id: string, userId: string, dto: UpdateVehicleDto) {
    const v = await this.findOwned(id, userId);
    return this.repo.save({ ...v, ...dto });
  }

  async remove(id: string, userId: string) {
    const v = await this.findOwned(id, userId);
    await this.repo.remove(v);
  }

  private async findOwned(id: string, userId: string) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle not found.');
    if (v.userId !== userId) throw new ForbiddenException();
    return v;
  }
}

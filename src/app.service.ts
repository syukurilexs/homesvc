import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<h1>Syukurilexs Home</h1> <h3>(A Smart Home System)</h3>';
  }
}

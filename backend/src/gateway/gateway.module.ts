import { Module } from '@nestjs/common';
import { HostGateway } from './host/host.gateway';
import { ParticipantGateway } from './participant/participant.gateway';
import { SessionsModule } from '../sessions/sessions.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [SessionsModule, QuizzesModule, ResultsModule],
  providers: [HostGateway, ParticipantGateway],
  exports: [HostGateway, ParticipantGateway],
})
export class GatewayModule {}

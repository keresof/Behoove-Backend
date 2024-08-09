import cron from 'node-cron';
import RefreshToken from '../modules/user/models/refreshToken';
import { CLEAR_EXPIRED_STORIES_SCHEDULE, CLEAR_EXPIRED_TOKENS_SCHEDULE, START_WEEKLY_CONTEST_SCHEDULE } from './constants';

class SchedulerService {
    private jobs: cron.ScheduledTask[] = [];

    initialize() {
        this.scheduleJob(CLEAR_EXPIRED_TOKENS_SCHEDULE, this.clearExpiredTokens);
        this.scheduleJob(CLEAR_EXPIRED_STORIES_SCHEDULE, this.clearExpiredStories);
        this.scheduleJob(START_WEEKLY_CONTEST_SCHEDULE, this.startWeeklyContest);
    }

    private scheduleJob(cronExpression: string, job: () => void) {
        const scheduledJob = cron.schedule(cronExpression, job);
        this.jobs.push(scheduledJob);
    }

    private async clearExpiredTokens() {
        console.log('Clearing expired refresh tokens...');
        await RefreshToken.deleteExpired();
        console.log('Expired refresh tokens cleared.');
    }

    private async startWeeklyContest(){

    }

    private async clearExpiredStories(){
        console.log('Clearing expired stories...');
    }

    stopAllJobs() {
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
    }


}

export default new SchedulerService();
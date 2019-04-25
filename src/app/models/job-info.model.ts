import * as moment from 'moment';

export class JobInfo {
    isSelected = false;
    constructor(
        public applicationId: string,
        public usedResource: string,
        public partition: string,
        public queueName: string,
        public submissionTimeNano: number,
        public allocations: JobAllocation[] | null,
        public applicationState: string
    ) {}

    get submissionTime() {
        const millisecs = Math.round(this.submissionTimeNano / (1000 * 1000));
        return moment(millisecs).format('YYYY/MM/DD HH:mm:ss');
    }

    setAllocations(allocs: JobAllocation[]) {
        this.allocations = allocs;
    }
}

export class JobAllocation {
    constructor(
        public allocationKey: string,
        public allocationTags: string,
        public uuid: string,
        public resource: string,
        public priority: string,
        public queueName: string,
        public nodeId: string,
        public applicationId: string,
        public partition: string
    ) {}
}

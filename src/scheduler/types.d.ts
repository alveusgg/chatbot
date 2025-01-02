export interface ScheduledTask {
  name: string;

  enabled: boolean;
  
  runAt: {
    hour: number;
    minute: number;
  };

  run: () => void | Promise<void>
}

export type TaskRegister = (controller: import('../controller.js')) => ScheduledTask | Array<ScheduledTask>;

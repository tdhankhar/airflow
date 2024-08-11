export default {
  WORKER_BASE_IMAGE: "tdhankhar/test-server",
  WORKER_CMD: "workflow",
  WORKER_HOST_CONFIG: {
    NANO_CPUS: 1 * 1000000000,
    MEMORY: 512 * 1024 * 1024,
    MEMORY_SWAPS: 1024 * 1024 * 1024,
  },
};

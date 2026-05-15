const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const os = require("os");
const { exec } = require("child_process");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { OSUtils } = require("node-os-utils");

const osu = new OSUtils();
const cpuCores = os.cpus().length;

// =====================================================
// Persistent Identity
// =====================================================

const IDENTITY_FILE = "/var/lib/winone/node_identity.json";

function loadIdentity() {
  if (!fs.existsSync(IDENTITY_FILE)) {
    console.error(`Node identity file not found: ${IDENTITY_FILE}`);
    console.error("Run the node registration process first.");
    process.exit(1);
  }

  const identity = JSON.parse(fs.readFileSync(IDENTITY_FILE, "utf8"));

  if (!identity.nodeId || !identity.machineFingerprint) {
    console.error("Invalid node identity file.");
    process.exit(1);
  }

  return identity;
}

const identity = loadIdentity();
const NODE_ID = identity.nodeId;
const MACHINE_FINGERPRINT = identity.machineFingerprint;

console.log("Loaded node identity:", NODE_ID);

// =====================================================
// Registry gRPC Client
// =====================================================

const REGISTRY_PROTO_PATH = path.join(__dirname, "..", "registry.proto");
const registryPackageDefinition = protoLoader.loadSync(REGISTRY_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const registryProto = grpc.loadPackageDefinition(registryPackageDefinition)
  .registry;

const registryServerAddr = process.env.REGISTRY_SERVER_ADDRESS;
if (!registryServerAddr) {
  throw new Error("Missing REGISTRY_SERVER_ADDRESS");
}

const registryClient = new registryProto.Registry(
  registryServerAddr,
  grpc.credentials.createInsecure()
);

// =====================================================
// Queue gRPC Client
// =====================================================

const QUEUE_PROTO_PATH = path.join(__dirname, "..", "queue.proto");
const queuePackageDefinition = protoLoader.loadSync(QUEUE_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const queueProto = grpc.loadPackageDefinition(queuePackageDefinition)
  .nodeDetails;

const queueServerAddr = process.env.QUEUE_SERVER_ADDRESS;
if (!queueServerAddr) {
  throw new Error("Missing QUEUE_SERVER_ADDRESS");
}

const queueServerClient = new queueProto.NodeDetails(
  queueServerAddr,
  grpc.credentials.createInsecure()
);

// =====================================================
// OpenCL Detection
// =====================================================

function getOpenCLInfo() {
  return new Promise((resolve) => {
    exec("clinfo", (error, stdout, stderr) => {
      if (error) {
        console.warn(
          "clinfo failed, continuing without OpenCL info:",
          error.message || stderr || error
        );
        return resolve("");
      }

      resolve(stdout || "");
    });
  });
}

function parseCLInfo(data) {
  const result = {};

  if (!data || typeof data !== "string") {
    return result;
  }

  const lines = data.split("\n");
  const separatorRegex = /^(.+?)(?:\s{2,}|:\s*)(.+)$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(separatorRegex);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim();

    switch (key) {
      case "Number of platforms":
        result.platformCount = parseInt(value, 10);
        break;
      case "Platform Name":
        if (!result.platformName) result.platformName = value;
        break;
      case "Platform Vendor":
        result.platformVendor = value;
        break;
      case "Platform Version":
        result.platformVersion = value;
        break;
      case "Number of devices":
        result.deviceCount = parseInt(value, 10);
        break;
      case "Device Name":
        if (!result.deviceName) result.deviceName = value;
        break;
      case "Device Vendor":
        result.deviceVendor = value;
        break;
      case "Device Version":
        result.deviceVersion = value;
        break;
      case "Device Type":
        result.deviceType = value;
        break;
      case "Max compute units":
        result.computeUnits = parseInt(value, 10);
        break;
      case "Global memory size":
        result.globalMemory = value;
        break;
      case "Max clock frequency":
        result.clockMHz = parseInt(value, 10);
        break;
      default:
        break;
    }
  }

  return result;
}

// =====================================================
// Registry Validation
// =====================================================

async function validateNode() {
  return new Promise((resolve, reject) => {
    registryClient.checkNodeById(
      {
        nodeId: NODE_ID,
        machineFingerprint: MACHINE_FINGERPRINT,
      },
      (err, response) => {
        if (err) return reject(err);
        resolve(response);
      }
    );
  });
}

// =====================================================
// Collect Metrics
// =====================================================

async function collectMetrics() {
  const cpu = osu.cpu;
  const mem = osu.memory;

  const cpuInfo = await cpu.usage();
  const memInfo = await mem.info();
  const overview = await osu.overview();

  const ramTotalGB = +(
    memInfo.data.total.bytes /
    1024 ** 3
  ).toFixed(2);

  const ramFreeGB = +(
    memInfo.data.available.bytes /
    1024 ** 3
  ).toFixed(2);

  const uptimeSeconds = Math.floor(overview.system.uptimeSeconds);

  const nodeScore =
    cpuCores * 5 +
    ramFreeGB * 3 +
    (100 - cpuInfo.data) * 0.5;

  const clInfoRaw = await getOpenCLInfo();
  const clInfo = parseCLInfo(clInfoRaw);

  return {
    nodeId: NODE_ID,
    state: "heartBeat",

    cpuUsage: cpuInfo.data,
    systemInfo: overview.system,
    clInfo,
    platform: overview.platform,

    cpuCores,
    ramTotal: ramTotalGB,
    ramFree: ramFreeGB,

    gpuUtilization: null,
    gpuMemoryTotal: null,
    gpuMemoryFree: null,
    temperature: null,
    simulationsPerSecond: null,

    uptime: uptimeSeconds,

    nodeStatus: "online",
    nodeScore,

    lastHeartbeat: new Date(),
  };
}

// =====================================================
// Send Heartbeat
// =====================================================

async function sendHeartBeat() {
  try {
    // Verify the node still exists and belongs to this machine
    const validation = await validateNode();

    if (!validation || validation.details !== "done") {
      console.error("Node validation failed:", validation);
      return;
    }

    // Collect current system metrics
    const nodePayload = await collectMetrics();

    // Send heartbeat to queue service
    const response = await new Promise((resolve, reject) => {
      queueServerClient.heartBeatSignal(
        {
          QUEUE_NAME: NODE_ID,
          QUEUE_PAYLOAD: JSON.stringify(nodePayload),
          NODE_ID: NODE_ID,
        },
        (err, response) => {
          if (err) return reject(err);
          resolve(response);
        }
      );
    });

    console.log(
      `[${new Date().toISOString()}] Heartbeat sent for ${NODE_ID}`
    );
    console.log("heartBeatSignal:", response);
  } catch (error) {
    console.error("Heartbeat failed:", error.message || error);
  }
}

// =====================================================
// Startup
// =====================================================

async function start() {
  try {
    console.log("Validating node identity...");

    const validation = await validateNode();

    if (!validation || validation.details !== "done") {
      console.error("Node validation failed:", validation);
      process.exit(1);
    }

    console.log("Node validation successful.");

    // Send one heartbeat immediately
    await sendHeartBeat();

    // Then send every 5 seconds
    setInterval(sendHeartBeat, 5000);
    
  } catch (error) {
    console.error("Startup failed:", error.message || error);
    process.exit(1);
  }
}

start();
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import Docker from "dockerode";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const db = new PrismaClient();

const kafka = new Kafka({
  clientId: "airflow",
  brokers: [process.env.AIRFLOW_KAFKA_URL as string],
});

const eventProducer = kafka.producer();
const eventConsumer = kafka.consumer({ groupId: "executor" });
const eventManager = kafka.admin();

const docker = new Docker();

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.AIRFLOW_S3_URL as string,
  credentials: {
    accessKeyId: process.env.AIRFLOW_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AIRFLOW_S3_SECRET_ACCESS_KEY as string,
  },
  forcePathStyle: true,
});
const s3 = {
  put: async (s3Path: string, data: string, contentType: string) => {
    return s3Client.send(
      new PutObjectCommand({
        Bucket: "airflow",
        Key: s3Path,
        Body: data,
        ContentType: contentType,
      })
    );
  },
  get: async (s3Path: string) => {
    return s3Client.send(
      new GetObjectCommand({
        Bucket: "airflow",
        Key: s3Path,
      })
    );
  },
};

export { db, eventProducer, eventConsumer, eventManager, docker, s3 };

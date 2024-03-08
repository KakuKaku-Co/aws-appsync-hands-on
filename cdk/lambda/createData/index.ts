import { S3 } from "aws-sdk";

const s3 = new S3();

interface Result {
    id: string;
    name: string;
    email: string;
}

export const handler = async (event: any): Promise<Result> => {
    // DEBUG
    console.log("event:", event);

    const bucketName = process.env.BUCKET_NAME!;
    const fileName = `${event.arguments.id}.json`;
    const objectContent = JSON.stringify({
        id: event.arguments.id,
        name: event.arguments.name,
        email: "sample@gmail.com",
    });

    try {
        await s3
            .putObject({
                Bucket: bucketName,
                Key: fileName,
                Body: objectContent,
                ContentType: "application/json",
            })
            .promise();

        return {
            id: event.arguments.id,
            name: event.arguments.name,
            email: "sample@gmail.com",
        };
    } catch (error) {
        console.error(error);
        return {
            id: "",
            name: "",
            email: "",
        };
    }
};

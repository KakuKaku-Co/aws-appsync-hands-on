import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";

export class AppSyncSampleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ========================================================================
        // S3 の設定
        //
        // S3 バケットを作成し、以下の json データが書かれたファイルを配置する
        // {
        //     "id": "1",
        //     "name": "John Doe"
        // }
        // ========================================================================

        // S3 バケットの作成
        const sampleBacket = new s3.Bucket(this, "AppSyncSampleBucket", {
            bucketName: "appsync-sample-bucket",
            publicReadAccess: true,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
            }),
            objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // S3 バケットにデータを配置
        new s3deploy.BucketDeployment(this, "AppSyncSampleBucketDeployment", {
            sources: [s3deploy.Source.asset("assets")],
            destinationBucket: sampleBacket,
        });

        // ========================================================================
        // Lambda の設定
        // ========================================================================

        // Data 作成用の Lambda 関数を作成
        const lamdaSampleDataCreator = new lambdaNodeJS.NodejsFunction(this, "SampleDataCreator", {
            functionName: "SampleDataCreator",
            runtime: Runtime.NODEJS_18_X,
            entry: "./lambda/createData/index.ts",
            timeout: cdk.Duration.seconds(30),
            environment: {
                BUCKET_NAME: sampleBacket.bucketName,
            },
        });

        // S3 バケットへの書き込み権限を Lambda 関数に付与
        sampleBacket.grantWrite(lamdaSampleDataCreator);

        // ========================================================================
        // AppSync の設定
        // ========================================================================

        // AppSync API の作成
        const graphqlAPI = new appsync.GraphqlApi(this, "AppSyncAPIDemo", {
            name: "AppSyncAPIDemo",
            schema: appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
        });

        // HTTP DataSource の作成
        // データソースとして Mock API を指定する
        const s3URL = `https://${sampleBacket.bucketName}.s3.ap-northeast-1.amazonaws.com`;
        const httpDemoDS = graphqlAPI.addHttpDataSource("HttpDSDemo", s3URL, {
            name: "HttpDSDemo",
        });

        // S3 参照用の Resolver の作成
        // リゾルバー（js）とデータソースを関連付け、スキーマ（getAppSyncDemo）に紐づける
        new appsync.Resolver(this, "ResolverQueryGetAppSyncDemo", {
            api: graphqlAPI,
            typeName: "Query",
            fieldName: "getAppSyncDemo",
            dataSource: httpDemoDS,
            code: appsync.Code.fromAsset("resolvers/Query.getAppSyncDemo.js"),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
        });

        // Lambda DataSource の作成
        // データソースとして Lambda 関数を指定する
        const lambdaDemoDS = graphqlAPI.addLambdaDataSource("LambdaDSDemo", lamdaSampleDataCreator);
        new appsync.Resolver(this, "ResolverMutationCreateAppSyncDemo", {
            api: graphqlAPI,
            typeName: "Mutation",
            fieldName: "createAppSyncDemo",
            dataSource: lambdaDemoDS,
        });
    }
}

#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppSyncSampleStack } from "../lib/appsync-sample-stack";

const app = new cdk.App();
new AppSyncSampleStack(app, "AppSyncSampleStack", {
    env: {
        region: "ap-northeast-1",
    },
});

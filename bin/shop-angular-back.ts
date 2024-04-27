#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ShopAngularBackStack } from '../lib/shop-angular-back-stack';

const app = new cdk.App();
new ShopAngularBackStack(app, 'ShopAngularBackStack', {
   env: {
     account: process.env.CDK_DEFAULT_ACCOUNT,
     region: 'eu-central-1'
   },
});

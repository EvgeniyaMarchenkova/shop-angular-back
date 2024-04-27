import { ShopAngularBackStack } from '../lib/shop-angular-back-stack';
import {
  App,
} from 'aws-cdk-lib';
import { Construct } from 'constructs'


const app = new App();
new ShopAngularBackStack(app, 'ShopAngularBackStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-central-1'
  },
});

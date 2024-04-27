import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export class ShopAngularBackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsLambdaFunction = new lambda.Function(this, 'get-products-lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'lib/get-products.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });

    const getProductByIdLambdaFunction = new lambda.Function(this, 'get-product-by-id-lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'lib/get-product-by-id.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });

    const api = new apigateway.RestApi(this, 'products', {
      restApiName: "Products API Gateway",
      description: "This API serves the Lambda functions."
    });

    const getProductsFromLambda = new apigateway.LambdaIntegration(getProductsLambdaFunction, {
      integrationResponses: [
        {
          statusCode: '200',
        },
      ],
      proxy: false,
    });

    const getProductByIdFromLambda = new apigateway.LambdaIntegration(getProductByIdLambdaFunction, {
      integrationResponses: [
        {
          statusCode: '200',
        }
      ],
      requestTemplates: {
        "application/json":
          `{ "productId": "$method.request.path.productId" }`
      },
      proxy: false,
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', getProductsFromLambda, {
      methodResponses: [{
        statusCode: '200',
      }],
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    const productByIdResource = productsResource.addResource('{productId}');
    productByIdResource.addMethod('GET', getProductByIdFromLambda,{
      methodResponses: [{ statusCode: '200' }],
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    productsResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET'],
    });
    productByIdResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET'],
    });
  }
}

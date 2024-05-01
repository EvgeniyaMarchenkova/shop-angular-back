import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ShopAngularBackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTable = new dynamodb.Table(this, 'Products', {
      tableName: 'Products',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const stockTable = new dynamodb.Table(this, 'Stocks', {
      tableName: 'Stocks',
      partitionKey: {
        name: 'product_id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const baseLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    }

    const getProductsLambdaFunction = new lambda.Function(this, 'get-products-lambda-function', {
      handler: 'lib/get-products.main',
      ...baseLambdaProps
    });

    const getProductByIdLambdaFunction = new lambda.Function(this, 'get-product-by-id-lambda-function', {
      handler: 'lib/get-product-by-id.main',
      ...baseLambdaProps
    });

    const createProductLambdaFunction = new lambda.Function(this, 'create-product-lambda-function', {
      handler: 'lib/create-product.main',
      ...baseLambdaProps,
    });

    productTable.grantWriteData(createProductLambdaFunction);
    productTable.grantReadData(getProductByIdLambdaFunction);
    productTable.grantReadData(getProductsLambdaFunction);
    stockTable.grantWriteData(createProductLambdaFunction);
    stockTable.grantReadData(getProductByIdLambdaFunction);
    stockTable.grantReadData(getProductsLambdaFunction);

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

    const createProductFromLambda = new apigateway.LambdaIntegration(createProductLambdaFunction, {
      integrationResponses: [
        {
          statusCode: '201',
        },
      ],
      proxy: false,
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', getProductsFromLambda, {
      methodResponses: [{
        statusCode: '200',
      }],
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    productsResource.addMethod('POST', createProductFromLambda, {
      methodResponses: [{
        statusCode: '201',
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
      allowMethods: ['GET', 'POST'],
    });
    productByIdResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET'],
    });
  }
}

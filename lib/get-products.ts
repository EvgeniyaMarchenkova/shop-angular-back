import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const productsTableName = 'Products';
const stockTableName = 'Stocks';

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION_DEPLOY });
const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDB);

export async function main() {
  const getAllProductsCommand = new ScanCommand({
    TableName: productsTableName,
  });
  const getAllStockCommand = new ScanCommand({
    TableName: stockTableName,
  });

  const products = await dynamoDBDocumentClient.send(getAllProductsCommand);
  const stock = await dynamoDBDocumentClient.send(getAllStockCommand);

  const result = products.Items?.map((product) => ({
    ...product,
    count: stock.Items?.find((stock) => stock.product_id === product.id)
      ?.count,
  }));

  return result;
}

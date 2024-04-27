import { ProductService } from './product-service';

export async function main(event: any) {
  const product = ProductService.getProductById(event.productId);
  return {
    message: product
  };
}

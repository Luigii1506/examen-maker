# 🧩 Guía: Agregar Testing a Nuevos Módulos

> **Paso a paso para implementar testing en módulos nuevos**

## 🎯 Escenario: Crear Módulo "Product Catalog"

Vamos a crear un módulo completo desde cero con todos sus tests para que aprendas el proceso.

### **Paso 1: 📁 Crear Estructura del Módulo**

```bash
# Crear directorios del módulo
mkdir -p src/modules/product-catalog/{components,hooks,services,types,utils,__tests__}

# Estructura resultante:
src/modules/product-catalog/
├── 📁 components/           # Componentes React
├── 📁 hooks/               # Custom hooks
├── 📁 services/            # Lógica de negocio/API
├── 📁 types/               # Tipos TypeScript
├── 📁 utils/               # Funciones puras
├── 📁 __tests__/           # ✅ TODOS LOS TESTS
└── 📄 index.ts             # Exports públicos
```

### **Paso 2: 🛠️ Crear las Funciones/Componentes**

#### **2.1 Tipos (types/index.ts)**

```typescript
// src/modules/product-catalog/types/index.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  description?: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
```

#### **2.2 Utilidades (utils/index.ts)**

```typescript
// src/modules/product-catalog/utils/index.ts
import { Product, ProductFilter } from "../types";

export function filterProducts(
  products: Product[],
  filter: ProductFilter
): Product[] {
  return products.filter((product) => {
    if (filter.category && product.category !== filter.category) return false;
    if (filter.minPrice && product.price < filter.minPrice) return false;
    if (filter.maxPrice && product.price > filter.maxPrice) return false;
    if (filter.inStock !== undefined && product.inStock !== filter.inStock)
      return false;
    return true;
  });
}

export function formatProductPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function calculateDiscount(
  price: number,
  discountPercent: number
): number {
  return price * (discountPercent / 100);
}
```

#### **2.3 Servicio (services/index.ts)**

```typescript
// src/modules/product-catalog/services/index.ts
import { Product } from "../types";

export class ProductService {
  private static instance: ProductService;
  private products: Product[] = [];

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async fetchProducts(): Promise<Product[]> {
    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.products = [
      {
        id: "1",
        name: "Laptop",
        price: 999.99,
        category: "electronics",
        inStock: true,
      },
      {
        id: "2",
        name: "Phone",
        price: 599.99,
        category: "electronics",
        inStock: false,
      },
      { id: "3", name: "Book", price: 19.99, category: "books", inStock: true },
    ];

    return this.products;
  }

  async findProductById(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.products.find((p) => p.id === id) || null;
  }
}
```

#### **2.4 Hook (hooks/index.ts)**

```typescript
// src/modules/product-catalog/hooks/index.ts
import { useState, useEffect } from "react";
import { Product, ProductFilter } from "../types";
import { ProductService } from "../services";
import { filterProducts } from "../utils";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const service = ProductService.getInstance();
        const data = await service.fetchProducts();
        setProducts(data);
      } catch (err) {
        setError("Error loading products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, loading, error };
}

export function useProductFilter(products: Product[]) {
  const [filter, setFilter] = useState<ProductFilter>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    setFilteredProducts(filterProducts(products, filter));
  }, [products, filter]);

  return { filteredProducts, filter, setFilter };
}
```

#### **2.5 Componente (components/ProductList.tsx)**

```typescript
// src/modules/product-catalog/components/ProductList.tsx
import React from "react";
import { Product } from "../types";
import { formatProductPrice } from "../utils";

interface ProductListProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductClick,
}) => {
  if (products.length === 0) {
    return <div data-testid="empty-products">No products found</div>;
  }

  return (
    <div data-testid="product-list" className="grid gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          data-testid={`product-${product.id}`}
          className="border p-4 rounded cursor-pointer"
          onClick={() => onProductClick?.(product)}
        >
          <h3 data-testid="product-name" className="font-bold">
            {product.name}
          </h3>
          <p data-testid="product-price" className="text-green-600">
            {formatProductPrice(product.price)}
          </p>
          <p data-testid="product-category" className="text-gray-500">
            {product.category}
          </p>
          <span
            data-testid="product-stock"
            className={`px-2 py-1 rounded text-sm ${
              product.inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      ))}
    </div>
  );
};
```

### **Paso 3: 🧪 Crear TODOS los Tests**

#### **3.1 Unit Tests - Utilidades**

```typescript
// src/modules/product-catalog/__tests__/utils.test.ts
import {
  filterProducts,
  formatProductPrice,
  calculateDiscount,
} from "../utils";
import { Product } from "../types";

describe("Product Catalog Utils", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Laptop",
      price: 999.99,
      category: "electronics",
      inStock: true,
    },
    {
      id: "2",
      name: "Phone",
      price: 599.99,
      category: "electronics",
      inStock: false,
    },
    { id: "3", name: "Book", price: 19.99, category: "books", inStock: true },
  ];

  describe("filterProducts", () => {
    test("should filter by category", () => {
      const result = filterProducts(mockProducts, { category: "electronics" });
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("electronics");
      expect(result[1].category).toBe("electronics");
    });

    test("should filter by price range", () => {
      const result = filterProducts(mockProducts, {
        minPrice: 100,
        maxPrice: 700,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Phone");
    });

    test("should filter by stock status", () => {
      const result = filterProducts(mockProducts, { inStock: true });
      expect(result).toHaveLength(2);
      result.forEach((product) => {
        expect(product.inStock).toBe(true);
      });
    });

    test("should apply multiple filters", () => {
      const result = filterProducts(mockProducts, {
        category: "electronics",
        inStock: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Laptop");
    });
  });

  describe("formatProductPrice", () => {
    test("should format prices correctly", () => {
      expect(formatProductPrice(999.99)).toBe("$999.99");
      expect(formatProductPrice(19)).toBe("$19.00");
      expect(formatProductPrice(0)).toBe("$0.00");
    });
  });

  describe("calculateDiscount", () => {
    test("should calculate discounts correctly", () => {
      expect(calculateDiscount(100, 10)).toBe(10);
      expect(calculateDiscount(50, 25)).toBe(12.5);
      expect(calculateDiscount(200, 0)).toBe(0);
    });
  });
});
```

#### **3.2 Integration Tests - Servicio**

```typescript
// src/modules/product-catalog/__tests__/services.test.ts
import { ProductService } from "../services";

describe("ProductService", () => {
  let service: ProductService;

  beforeEach(() => {
    service = ProductService.getInstance();
  });

  test("should be a singleton", () => {
    const service1 = ProductService.getInstance();
    const service2 = ProductService.getInstance();
    expect(service1).toBe(service2);
  });

  test("should fetch products", async () => {
    const products = await service.fetchProducts();

    expect(products).toHaveLength(3);
    expect(products[0]).toMatchObject({
      id: "1",
      name: "Laptop",
      price: 999.99,
      category: "electronics",
      inStock: true,
    });
  });

  test("should find product by id", async () => {
    await service.fetchProducts(); // Cargar productos primero

    const product = await service.findProductById("1");
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Laptop");

    const notFound = await service.findProductById("999");
    expect(notFound).toBeNull();
  });
});
```

#### **3.3 Integration Tests - Componente**

```typescript
// src/modules/product-catalog/__tests__/ProductList.test.tsx
import React from "react";
import { renderWithProviders } from "@/shared/testing";
import { ProductList } from "../components/ProductList";
import { Product } from "../types";

describe("ProductList", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Laptop",
      price: 999.99,
      category: "electronics",
      inStock: true,
    },
    {
      id: "2",
      name: "Phone",
      price: 599.99,
      category: "electronics",
      inStock: false,
    },
  ];

  test("should render products list", () => {
    const { getByTestId } = renderWithProviders(
      <ProductList products={mockProducts} />
    );

    expect(getByTestId("product-list")).toBeTruthy();
    expect(getByTestId("product-1")).toBeTruthy();
    expect(getByTestId("product-2")).toBeTruthy();
  });

  test("should display product information correctly", () => {
    const { getByTestId } = renderWithProviders(
      <ProductList products={[mockProducts[0]]} />
    );

    expect(getByTestId("product-name").textContent).toBe("Laptop");
    expect(getByTestId("product-price").textContent).toBe("$999.99");
    expect(getByTestId("product-category").textContent).toBe("electronics");
    expect(getByTestId("product-stock").textContent).toBe("In Stock");
  });

  test("should show empty state when no products", () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <ProductList products={[]} />
    );

    expect(getByTestId("empty-products")).toBeTruthy();
    expect(getByTestId("empty-products").textContent).toBe("No products found");
    expect(queryByTestId("product-list")).toBeFalsy();
  });

  test("should call onProductClick when product is clicked", () => {
    const mockOnClick = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ProductList products={[mockProducts[0]]} onProductClick={mockOnClick} />
    );

    getByTestId("product-1").click();

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockProducts[0]);
  });

  test("should display correct stock status styling", () => {
    const { getByTestId } = renderWithProviders(
      <ProductList products={mockProducts} />
    );

    // Producto en stock
    const inStockElement = getByTestId("product-1").querySelector(
      '[data-testid="product-stock"]'
    );
    expect(inStockElement?.className).toContain("bg-green-100");

    // Producto sin stock
    const outOfStockElement = getByTestId("product-2").querySelector(
      '[data-testid="product-stock"]'
    );
    expect(outOfStockElement?.className).toContain("bg-red-100");
  });
});
```

#### **3.4 Integration Tests - Hook**

```typescript
// src/modules/product-catalog/__tests__/hooks.test.ts
import { renderHook } from "@testing-library/react";
import { useProducts, useProductFilter } from "../hooks";
import { Product } from "../types";

// Mock del servicio
jest.mock("../services", () => ({
  ProductService: {
    getInstance: () => ({
      fetchProducts: jest
        .fn()
        .mockResolvedValue([
          {
            id: "1",
            name: "Test Product",
            price: 99.99,
            category: "test",
            inStock: true,
          },
        ]),
    }),
  },
}));

describe("Product Hooks", () => {
  describe("useProducts", () => {
    test("should start with loading state", () => {
      const { result } = renderHook(() => useProducts());

      expect(result.current.loading).toBe(true);
      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    test("should load products", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProducts());

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.products).toHaveLength(1);
      expect(result.current.error).toBe(null);
    });
  });

  describe("useProductFilter", () => {
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Laptop",
        price: 999.99,
        category: "electronics",
        inStock: true,
      },
      { id: "2", name: "Book", price: 19.99, category: "books", inStock: true },
    ];

    test("should filter products by category", () => {
      const { result } = renderHook(() => useProductFilter(mockProducts));

      // Inicialmente debe mostrar todos
      expect(result.current.filteredProducts).toHaveLength(2);

      // Filtrar por categoría
      result.current.setFilter({ category: "electronics" });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].category).toBe("electronics");
    });
  });
});
```

### **Paso 4: 🎭 E2E Tests para el Módulo**

```typescript
// e2e/tests/product-catalog.spec.ts
import { test, expect } from "@playwright/test";

describe("Product Catalog E2E", () => {
  test("user can browse and filter products", async ({ page }) => {
    await page.goto("/products");

    // Verificar que se cargan los productos
    await expect(page.getByTestId("product-list")).toBeVisible();
    await expect(page.getByTestId("product-1")).toBeVisible();

    // Verificar información del producto
    await expect(page.getByTestId("product-name").first()).toContainText(
      "Laptop"
    );
    await expect(page.getByTestId("product-price").first()).toContainText(
      "$999.99"
    );

    // Filtrar por categoría
    await page.selectOption('[data-testid="category-filter"]', "electronics");

    // Verificar que se aplicó el filtro
    await expect(page.getByTestId("product-1")).toBeVisible();
    await expect(page.getByTestId("product-3")).not.toBeVisible(); // Book should be hidden

    // Hacer click en un producto
    await page.click('[data-testid="product-1"]');

    // Verificar navegación a detalle
    await expect(page).toHaveURL("/products/1");
    await expect(page.getByTestId("product-detail")).toBeVisible();
  });
});
```

### **Paso 5: 📄 Export del Módulo**

```typescript
// src/modules/product-catalog/index.ts
// 🧩 PRODUCT CATALOG MODULE
// ========================
// Exportaciones públicas del módulo

// Componentes
export { ProductList } from "./components/ProductList";

// Hooks
export { useProducts, useProductFilter } from "./hooks";

// Servicios
export { ProductService } from "./services";

// Tipos
export type { Product, ProductFilter } from "./types";

// Utilidades
export { filterProducts, formatProductPrice, calculateDiscount } from "./utils";
```

### **Paso 6: ✅ Ejecutar Tests**

```bash
# Tests específicos del módulo
npm test -- product-catalog

# Tests por tipo
npm test -- product-catalog/utils           # Unit tests
npm test -- product-catalog/ProductList     # Component tests
npm test -- product-catalog/hooks           # Hook tests
npm test -- product-catalog/services        # Service tests

# E2E tests
npm run test:e2e -- product-catalog.spec.ts

# Coverage del módulo
npm run test:coverage -- --testPathPattern=product-catalog
```

## 📋 Checklist para Nuevos Módulos

### **✅ Estructura de Archivos**

- [ ] Crear directorio `src/modules/[module-name]/`
- [ ] Subdirectorios: `components/`, `hooks/`, `services/`, `types/`, `utils/`, `__tests__/`
- [ ] Archivo `index.ts` para exports públicos

### **✅ Unit Tests (Funciones Puras)**

- [ ] Test para cada función en `utils/`
- [ ] Test de casos edge (valores límite, errores)
- [ ] Test de validaciones
- [ ] Coverage > 90% para utilidades

### **✅ Integration Tests (Componentes)**

- [ ] Test de renderizado básico
- [ ] Test de props y estados
- [ ] Test de interacciones (clicks, inputs)
- [ ] Test de callbacks
- [ ] Test de casos edge (datos vacíos, errores)

### **✅ Service Tests**

- [ ] Test de métodos públicos
- [ ] Test de estados asíncronos
- [ ] Mock de dependencias externas
- [ ] Test de manejo de errores

### **✅ Hook Tests**

- [ ] Test de estados iniciales
- [ ] Test de efectos (useEffect)
- [ ] Test de cambios de estado
- [ ] Test con `renderHook` de Testing Library

### **✅ E2E Tests**

- [ ] Test de flujo principal del módulo
- [ ] Test de navegación
- [ ] Test de integración con otros módulos
- [ ] Test en diferentes dispositivos

### **✅ Documentación**

- [ ] README del módulo (`src/modules/[module]/README.md`)
- [ ] Comentarios en tests explicando qué se prueba
- [ ] Ejemplos de uso en el README

## 🎯 Mejores Prácticas por Tipo

### **🧪 Unit Tests - Do's & Don'ts**

#### ✅ DO (Hacer)

```typescript
// ✅ Testear una sola función
test("should format price correctly", () => {
  expect(formatPrice(99.99)).toBe("$99.99");
});

// ✅ Testear casos edge
test("should handle zero price", () => {
  expect(formatPrice(0)).toBe("$0.00");
});

// ✅ Describir claramente qué se prueba
test("should throw error for negative prices", () => {
  expect(() => formatPrice(-10)).toThrow("Price cannot be negative");
});
```

#### ❌ DON'T (No hacer)

```typescript
// ❌ Testear múltiples cosas en un test
test("should format and validate prices", () => {
  expect(formatPrice(99.99)).toBe("$99.99");
  expect(isValidPrice(-10)).toBe(false); // Diferente función
});

// ❌ Tests vagos sin contexto
test("should work", () => {
  expect(formatPrice(10)).toBe("$10.00");
});

// ❌ No testear casos edge
test("should format price", () => {
  expect(formatPrice(99.99)).toBe("$99.99");
  // Missing: 0, negativos, decimales, etc.
});
```

### **🔗 Integration Tests - Do's & Don'ts**

#### ✅ DO (Hacer)

```typescript
// ✅ Testear interacciones completas
test("should update product list when filter changes", async () => {
  const { getByTestId } = renderWithProviders(<ProductFilter />);

  // Estado inicial
  expect(getByTestId("product-count")).toHaveTextContent("10 products");

  // Aplicar filtro
  fireEvent.change(getByTestId("category-select"), {
    target: { value: "electronics" },
  });

  // Verificar resultado
  await waitFor(() => {
    expect(getByTestId("product-count")).toHaveTextContent("3 products");
  });
});

// ✅ Testear estados de loading/error
test("should show loading state while fetching", () => {
  const { getByTestId } = renderWithProviders(<ProductList />);
  expect(getByTestId("loading-spinner")).toBeVisible();
});
```

#### ❌ DON'T (No hacer)

```typescript
// ❌ Testear solo renderizado básico
test("should render", () => {
  const { getByTestId } = renderWithProviders(<ProductList />);
  expect(getByTestId("product-list")).toBeTruthy();
  // Missing: interactions, states, edge cases
});

// ❌ No testear states asíncronos
test("should load products", () => {
  renderWithProviders(<ProductList />);
  // Missing: loading state, success state, error state
});
```

### **🎭 E2E Tests - Do's & Don'ts**

#### ✅ DO (Hacer)

```typescript
// ✅ Testear flujos completos de usuario
test("user can search and buy product", async ({ page }) => {
  await page.goto("/products");

  // Buscar producto
  await page.fill('[data-testid="search-input"]', "laptop");
  await page.click('[data-testid="search-button"]');

  // Seleccionar producto
  await page.click('[data-testid="product-1"]');

  // Agregar al carrito
  await page.click('[data-testid="add-to-cart"]');

  // Verificar carrito
  await expect(page.getByTestId("cart-count")).toHaveText("1");
});

// ✅ Testear navegación entre páginas
test("navigation works correctly", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="products-link"]');
  await expect(page).toHaveURL("/products");
});
```

#### ❌ DON'T (No hacer)

```typescript
// ❌ Testear solo una página sin interacción
test("products page loads", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByTestId("product-list")).toBeVisible();
  // Missing: user interactions, navigation, full flows
});

// ❌ Duplicar unit/integration tests en E2E
test("product price format is correct", async ({ page }) => {
  // Esto debería ser un unit test, no E2E
});
```

## 🎉 ¡Listo!

Ahora tienes un módulo completo con:

- ✅ **Unit tests** para funciones puras
- ✅ **Integration tests** para componentes y hooks
- ✅ **Service tests** para lógica de negocio
- ✅ **E2E tests** para flujos de usuario
- ✅ **Estructura modular** escalable
- ✅ **Documentación** completa

**Repite este proceso para cada nuevo módulo** y tendrás una aplicación robusta y bien probada. 🚀

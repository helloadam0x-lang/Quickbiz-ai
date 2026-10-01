export type Prod = { src: string; name: string; price: string; was?: string; sale?: string; fit?: "cover" | "contain" };

export const P: Record<string, Prod> = {
  madrid: { src: "products/polo-madrid.jpg", name: "Madrid Polo", price: "UGX 100,000" },
  london: { src: "products/polo-london.jpg", name: "London Polo", price: "UGX 100,000" },
  paris: { src: "products/polo-paris.jpg", name: "Paris Polo", price: "UGX 100,000" },
  newyork: { src: "products/polo-newyork.jpg", name: "New York Polo", price: "UGX 100,000" },
  red: { src: "products/polo-red.jpg", name: "This Life Polo", price: "UGX 100,000", was: "UGX 140,000", sale: "-29%" },
  londonCyan: { src: "products/polo-london-cyan.jpg", name: "London Polo · Sky", price: "UGX 100,000" },
  magenta: { src: "products/polo-magenta.jpg", name: "Classic Polo · Pink", price: "UGX 100,000" },
  supreme: { src: "products/jersey-supreme.jpg", name: "Supreme Jersey", price: "UGX 180,000", fit: "contain" },
  asics: { src: "products/asics-gel.jpg", name: "ASICS Gel-1130", price: "UGX 320,000", fit: "contain" },
  cerave: { src: "products/cerave-lotion.jpg", name: "CeraVe Daily Lotion", price: "UGX 65,000", fit: "contain" },
  nivea: { src: "products/nivea-rollon.jpg", name: "NIVEA Roll-on", price: "UGX 18,000", fit: "contain" },
  perfume: { src: "stock/perfume.jpg", name: "Axis Eau de Parfum", price: "UGX 120,000" },
};

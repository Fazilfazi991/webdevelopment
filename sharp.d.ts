declare module "sharp" {
  type SharpStats = { dominant: { r: number; g: number; b: number } };
  type SharpInstance = {
    resize(width: number, height: number, options?: { fit?: string }): SharpInstance;
    stats(): Promise<SharpStats>;
  };
  export default function sharp(input: Buffer): SharpInstance;
}

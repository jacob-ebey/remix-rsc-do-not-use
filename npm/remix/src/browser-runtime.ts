export declare function importById(id: string): Promise<any>;

export declare const moduleMap: Record<
  string,
  Record<
    string,
    {
      id: string;
      name: string;
      chunks: string[];
      async: true;
    }
  >
>;

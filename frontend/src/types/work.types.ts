export interface Work {
  _id: string;
  title: string;
  author: string;
  publishedAt: string;
  type: string;
  genre: string[];
  description?: string;
  images?: string[];
  reviews?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorksResponse {
  success: boolean;
  message?: string;
  data: {
    count: number;
    works: Work[];
  };
  errors?: string;
}


// Mock database - in a real app, you'd use a proper database
let mockDatabase: any[] = [];

export function getMockDatabase() {
  return mockDatabase;
}

export function addToMockDatabase(data: any) {
  mockDatabase.push({
    id: Date.now(),
    ...data,
    created_at: new Date().toISOString()
  });
}

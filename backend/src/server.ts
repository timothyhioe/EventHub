import app from './app';

// This file is the entry point for the server
// The app is imported and started here

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API available at http://localhost:${PORT}`);
});

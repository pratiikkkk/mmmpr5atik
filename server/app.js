const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/employee', require('./routes/employee.routes'));
app.use('/api/api-link', require('./routes/apiLink.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Centralized error handler (ERP minimal)
app.use((err, req, res, next) => {
  res.status(500).json({
    statusCode: -99,
    message: err.message
  });
});
// basic health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// start server when run directly
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}

module.exports = app;

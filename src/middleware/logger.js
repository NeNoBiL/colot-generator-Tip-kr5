const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  
  console.log(`[${timestamp}] ${method} ${url}`);
  console.log(`  Query: ${query}`);
  console.log(`  Params: ${params}`);
  
  // Сохраняем данные для возможного использования в контроллерах
  req.requestTime = timestamp;
  
  next();
};

module.exports = logger;
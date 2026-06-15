export interface StructuredChallenge {
  id: string;
  riddleTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  businessContext: string;
  objective: string;
  schemaTableName: string;
  schemaColumns: { name: string; type: string; description?: string }[];
  createTableSql: string;
  sampleData: { [key: string]: any }[];
  expectedOutput: { [key: string]: any }[];
  requirements: string[];
  hints: string[];
  correctSolution: string;
  discussion: {
    worksExplanation: string;
    commonMistakes: string;
    performance: string;
  };
}

export const CHALLENGE_STRUCTURES: { [dayId: string]: StructuredChallenge } = {
  "W1-D1": {
    id: "W1-D1",
    riddleTitle: "The Rogue Executive",
    difficulty: "Medium",
    businessContext: "The Internal Audit and HR compliance teams are performing random checks on compensation metrics. They need to analyze high-earning employee distributions within critical divisions.",
    objective: "Identify employee_id, first_name, last_name, and salary for all employees who belong to Department 10 and make more than ₹150,000, excluding any employees hired during the 2026 calendar year.",
    schemaTableName: "employees",
    schemaColumns: [
      { name: "employee_id", type: "INT", description: "Unique identifier for the employee" },
      { name: "first_name", type: "VARCHAR(100)", description: "Employee given name" },
      { name: "last_name", type: "VARCHAR(100)", description: "Employee family name" },
      { name: "department_id", type: "INT", description: "Reference value corresponding to the operating department" },
      { name: "salary", type: "DECIMAL(12,2)", description: "Annual earnings compiled in standard monetary units" },
      { name: "hire_date", type: "DATE", description: "Official company registration start timestamp" }
    ],
    createTableSql: `CREATE TABLE employees (
  employee_id INT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  department_id INT,
  salary DECIMAL(12,2),
  hire_date DATE
);`,
    sampleData: [
      { employee_id: 101, first_name: "John", last_name: "Doe", department_id: 10, salary: 180000.00, hire_date: "2024-03-12" },
      { employee_id: 102, first_name: "Sarah", last_name: "Smith", department_id: 20, salary: 140000.00, hire_date: "2025-05-18" },
      { employee_id: 103, first_name: "Arun", last_name: "Kumar", department_id: 10, salary: 160000.00, hire_date: "2026-02-10" },
      { employee_id: 104, first_name: "Athila", last_name: "Begum", department_id: 10, salary: 155000.00, hire_date: "2025-08-20" }
    ],
    expectedOutput: [
      { employee_id: 101, first_name: "John", last_name: "Doe", salary: 180000.00 },
      { employee_id: 104, first_name: "Athila", last_name: "Begum", salary: 155000.00 }
    ],
    requirements: [
      "Filter by department_id strictly equal to 10.",
      "Filter by salary strictly greater than 150000.",
      "Exclude any records with hire_date occurring between '2026-01-01' and '2026-12-31' inclusive."
    ],
    hints: [
      "Use WHERE conditional chaining with the AND logical operator.",
      "You can filter out the year 2026 by using date comparison boundaries: hire_date < '2026-01-01' OR hire_date > '2026-12-31'.",
      "Ensure salary check relies on the strict inequality (>) rather than greater-than-or-equal-to."
    ],
    correctSolution: `SELECT 
  employee_id, 
  first_name, 
  last_name, 
  salary
FROM employees
WHERE department_id = 10 
  AND salary > 150000 
  AND (hire_date < '2026-01-01' OR hire_date > '2026-12-31');`,
    discussion: {
      worksExplanation: "This database query utilizes simple set filtering. By placing WHERE predicates on department index, salary parameters, and date bounds, the storage engine slices unwanted tuples prior to building the result vectors.",
      commonMistakes: "The most frequent error is neglecting the exclusive boundary of 2026, or utilizing BETWEEN '2026-01-01' and '2026-12-31' without a NOT operator.",
      performance: "Ensure an index is available on department_id and hire_date for ultra-fast, index-only scans on massive data hubs."
    }
  },
  "W1-D2": {
    id: "W1-D2",
    riddleTitle: "The Tiered Discount",
    difficulty: "Medium",
    businessContext: "The Customer Loyalty and Finance groups want to analyze annual customer expenditures. They need to categorize accounts into structured tiers to apply proportional discounts.",
    objective: "Write a SQL statement that checks annual_spend and tenure_years to compute a structured 'customer_tier' label for all customer accounts.",
    schemaTableName: "customers",
    schemaColumns: [
      { name: "customer_id", type: "INT", description: "Unique client account code" },
      { name: "annual_spend", type: "DECIMAL(12,2)", description: "Gross sum spent inside the last year" },
      { name: "tenure_years", type: "INT", description: "Number of years connected to the platform" }
    ],
    createTableSql: `CREATE TABLE customers (
  customer_id INT,
  annual_spend DECIMAL(12,2),
  tenure_years INT
);`,
    sampleData: [
      { customer_id: 501, annual_spend: 12000.00, tenure_years: 6 },
      { customer_id: 502, annual_spend: 6000.00, tenure_years: 4 },
      { customer_id: 503, annual_spend: 2500.00, tenure_years: 2 },
      { customer_id: 504, annual_spend: 500.00, tenure_years: 1 }
    ],
    expectedOutput: [
      { customer_id: 501, annual_spend: 12000.00, customer_tier: "Platinum Elite" },
      { customer_id: 502, annual_spend: 6000.00, customer_tier: "Gold Preferred" },
      { customer_id: 503, annual_spend: 2500.00, customer_tier: "Silver Active" },
      { customer_id: 504, annual_spend: 500.00, customer_tier: "Standard Client" }
    ],
    requirements: [
      "Compute `customer_tier` = 'Platinum Elite' for spent > 10,000 and tenure > 5 years.",
      "Compute `customer_tier` = 'Gold Preferred' for spent > 5,000 and tenure > 3 years.",
      "Compute `customer_tier` = 'Silver Active' for spent > 1,000.",
      "Fall back to 'Standard Client' for all other records."
    ],
    hints: [
      "Use CASE WHEN statements, evaluating from the most restrictive condition down to the least restrictive.",
      "Ensure conditions check both annual_spend and tenure_years concurrently in the compound segments using AND.",
      "Double-check that the calculated column is aliased exactly as 'customer_tier'."
    ],
    correctSolution: `SELECT 
  customer_id, 
  annual_spend, 
  CASE 
    WHEN annual_spend > 10000 AND tenure_years > 5 THEN 'Platinum Elite'
    WHEN annual_spend > 5000 AND tenure_years > 3 THEN 'Gold Preferred'
    WHEN annual_spend > 1000 THEN 'Silver Active'
    ELSE 'Standard Client'
  END as customer_tier
FROM customers;`,
    discussion: {
      worksExplanation: "CASE WHEN evaluates conditions sequentially. Placing the highly restrictive Platinum criteria at the very top guarantees that Platinum accounts do not get incorrectly swallowed by Gold or Silver criteria.",
      commonMistakes: "Placing 'spent > 1000' at the top of the CASE block. Since CASE terminates at the first true match, subsequent checks like spent > 10000 would never evaluate.",
      performance: "Evaluating CASE matches happens in-memory per row. It is computationally lightweight, though nested condition arrays should be kept flat."
    }
  },
  "W1-D3": {
    id: "W1-D3",
    riddleTitle: "The Suspect Accounts",
    difficulty: "Medium",
    businessContext: "The risk management division is checking logs for suspicious financial activities, identifying high-frequency or high-volume aggregates that exceed security baseline limits.",
    objective: "Identify bank account_ids where transaction volume counts exceed 5 and total sum aggregate transfer amounts exceed 20,000.",
    schemaTableName: "bank_transactions",
    schemaColumns: [
      { name: "transaction_id", type: "INT", description: "Primary transaction log sequence" },
      { name: "account_id", type: "INT", description: "Associated banking account reference code" },
      { name: "amount", type: "DECIMAL(12,2)", description: "Transfer size (Credits are positive; debits are negative)" }
    ],
    createTableSql: `CREATE TABLE bank_transactions (
  transaction_id INT,
  account_id INT,
  amount DECIMAL(12,2)
);`,
    sampleData: [
      { transaction_id: 1, account_id: 901, amount: 5000.00 },
      { transaction_id: 2, account_id: 901, amount: 4500.00 },
      { transaction_id: 3, account_id: 901, amount: 6000.00 },
      { transaction_id: 4, account_id: 901, amount: 3000.00 },
      { transaction_id: 5, account_id: 901, amount: 2000.00 },
      { transaction_id: 6, account_id: 901, amount: 1000.00 },
      { transaction_id: 7, account_id: 902, amount: 25000.00 }
    ],
    expectedOutput: [
      { account_id: 901, transaction_count: 6, total_sum: 21500.00 }
    ],
    requirements: [
      "Group results by account_id to aggregate transaction flows.",
      "Check that individual account groups have strictly higher than 5 transactions in total.",
      "Check that the overall transaction amount remains strictly greater than 20,000."
    ],
    hints: [
      "Remember that WHERE filters raw rows, while HAVING filters grouped aggregates.",
      "Use COUNT(*) to extract the total number of logs, and SUM(amount) to find total cash volumes.",
      "Position the compound AND filter directly inside the HAVING block."
    ],
    correctSolution: `SELECT 
  account_id, 
  COUNT(*) as transaction_count, 
  SUM(amount) as total_sum
FROM bank_transactions
GROUP BY account_id
HAVING COUNT(*) > 5 
  AND SUM(amount) > 20000;`,
    discussion: {
      worksExplanation: "This query leverages GROUP BY to bucket records, and computes COUNT() and SUM() state arrays. The HAVING query filter evaluates the resulting arrays and passes matching accounts.",
      commonMistakes: "Trying to filter SUM(amount) or COUNT(*) within the WHERE clause, which is a major syntax error in SQL.",
      performance: "Pre-filtering can reduce sorting loads. Using composite indices on account_id accelerates group lookups."
    }
  },
  "W1-D4": {
    id: "W1-D4",
    riddleTitle: "The Ghost Users",
    difficulty: "Easy",
    businessContext: "The marketing optimization team wants to identify signup registrations that have zero active corporate orders. These represent prospects requiring targeted onboarding campaigns.",
    objective: "Identify user_id, username, and signup_date for clients who have successfully signed up but have not committed any order bookings.",
    schemaTableName: "users / orders",
    schemaColumns: [
      { name: "user_id (users)", type: "INT", description: "Primary unique client code" },
      { name: "username (users)", type: "VARCHAR(100)", description: "Client platform display name" },
      { name: "signup_date (users)", type: "DATE", description: "Platform registration timestamp" },
      { name: "order_id (orders)", type: "INT", description: "Unique purchase booking sequence" },
      { name: "user_id (orders)", type: "INT", description: "Foreign key linking back to users table" },
      { name: "order_amount (orders)", type: "DECIMAL(12,2)", description: "Gross checkout amount of order" }
    ],
    createTableSql: `CREATE TABLE users (
  user_id INT,
  username VARCHAR(100),
  signup_date DATE
);

CREATE TABLE orders (
  order_id INT,
  user_id INT,
  order_amount DECIMAL(12,2)
);`,
    sampleData: [
      { user_id: 11, username: "haripc", signup_date: "2025-01-10" },
      { user_id: 12, username: "athila_dev", signup_date: "2025-02-14" },
      { user_id: 13, username: "coach_spark", signup_date: "2025-03-20" }
    ],
    expectedOutput: [
      { user_id: 13, username: "coach_spark", signup_date: "2025-03-20" }
    ],
    requirements: [
      "Use a LEFT OUTER JOIN to merge users (left) and orders (right) tables.",
      "Establish correlation on user_id columns present in both layouts.",
      "Filter out any joined rows where orders table fields (like order_id or user_id) are not null."
    ],
    hints: [
      "Look for mismatch vectors by filtering 'o.order_id IS NULL' inside the final WHERE clause.",
      "A left join includes all left-hand records; missing right-hand links automatically appear as NULL.",
      "Do not combine with inner join, which deletes non-buying shoppers entirely."
    ],
    correctSolution: `SELECT 
  u.user_id, 
  u.username, 
  u.signup_date
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL;`,
    discussion: {
      worksExplanation: "This matches users to orders with a Left Join. Unmatched rows yield NULL fields. The WHERE block isolates these null-connected instances to find inactive users.",
      commonMistakes: "Executing an INNER JOIN or checking orders using '=' rather than 'IS NULL' syntax.",
      performance: "Index the join keys on both layouts, especially the foreign keys on the transactional table."
    }
  },
  "W1-D5": {
    id: "W1-D5",
    riddleTitle: "The Leaderboard",
    difficulty: "Easy",
    businessContext: "The Category Merchandising team needs to track top product metrics. They need to locate high performing products inside focus classifications.",
    objective: "Identify product_id, product_name, and total_revenue for the top 3 revenue-generating inventory items within the 'Electronics' category, sorted descending.",
    schemaTableName: "products",
    schemaColumns: [
      { name: "product_id", type: "INT", description: "Unique inventory SKU sequence" },
      { name: "product_name", type: "VARCHAR(150)", description: "Human product SKU label" },
      { name: "category", type: "VARCHAR(100)", description: "Department classification grouping" },
      { name: "total_revenue", type: "DECIMAL(15,2)", description: "Gross compiled product sales metric" }
    ],
    createTableSql: `CREATE TABLE products (
  product_id INT,
  product_name VARCHAR(150),
  category VARCHAR(100),
  total_revenue DECIMAL(15,2)
);`,
    sampleData: [
      { product_id: 201, product_name: "4K smart Monitor", category: "Electronics", total_revenue: 95000.00 },
      { product_id: 202, product_name: "Noise-Cancelling headphones", category: "Electronics", total_revenue: 120000.00 },
      { product_id: 203, product_name: "Ergonomic Office chair", category: "Office", total_revenue: 45000.00 },
      { product_id: 204, product_name: "Mechanical Keyboard", category: "Electronics", total_revenue: 35000.00 },
      { product_id: 205, product_name: "USB-C Laptop Dock", category: "Electronics", total_revenue: 85000.00 }
    ],
    expectedOutput: [
      { product_id: 202, product_name: "Noise-Cancelling headphones", total_revenue: 120000.00 },
      { product_id: 201, product_name: "4K smart Monitor", total_revenue: 95000.00 },
      { product_id: 205, product_name: "USB-C Laptop Dock", total_revenue: 85000.00 }
    ],
    requirements: [
      "Select only items where category is exactly 'Electronics'.",
      "Sort the records descending based on total_revenue.",
      "Limit output to exactly the top 3 rows."
    ],
    hints: [
      "Combine WHERE category filter, ORDER BY desc logic, and a final LIMIT statement.",
      "Ensure ORDER BY specifies descending order with the DESC keyword.",
      "Be careful not to select non-Electronics items by sorting first."
    ],
    correctSolution: `SELECT 
  product_id, 
  product_name, 
  total_revenue
FROM products
WHERE category = 'Electronics'
ORDER BY total_revenue DESC
LIMIT 3;`,
    discussion: {
      worksExplanation: "The WHERE clause filters out non-Electronics items, ORDER BY DESC sorts the matching rows, and LIMIT 3 trims off the remaining records to isolate the top three.",
      commonMistakes: "Omitting the DESC keyword (sorting ASC by default) or placing LIMIT inside the wrong query location.",
      performance: "When using ORDER BY on large tables, index the columns used in sorting to prevent high-overhead filesort operations."
    }
  },
  "W2-D1": {
    id: "W2-D1",
    riddleTitle: "The Multi-Layered Audit",
    difficulty: "Medium",
    businessContext: "The financial integrity division wants to audit system transactions and identify outbound transfers whose volume strictly exceeds general transaction averages.",
    objective: "Construct a query using a single Common Table Expression (CTE) to calculate the overarching transaction average and find all records that place above this average.",
    schemaTableName: "transactions",
    schemaColumns: [
      { name: "tx_id", type: "INT", description: "Unique transaction identifier" },
      { name: "customer_id", type: "INT", description: "Customer account correlation ID" },
      { name: "amount", type: "DECIMAL(12,2)", description: "Financial transaction size" },
      { name: "tx_date", type: "DATE", description: "Log timestamp" }
    ],
    createTableSql: `CREATE TABLE transactions (
  tx_id INT,
  customer_id INT,
  amount DECIMAL(12,2),
  tx_date DATE
);`,
    sampleData: [
      { tx_id: 401, customer_id: 88, amount: 1500.00, tx_date: "2025-05-10" },
      { tx_id: 402, customer_id: 89, amount: 2500.00, tx_date: "2025-05-11" },
      { tx_id: 403, customer_id: 90, amount: 800.00, tx_date: "2025-05-12" },
      { tx_id: 404, customer_id: 91, amount: 3200.00, tx_date: "2025-05-13" }
    ],
    expectedOutput: [
      { tx_id: 402, customer_id: 89, amount: 2500.00, overall_avg: 2000.00 },
      { tx_id: 404, customer_id: 91, amount: 3200.00, overall_avg: 2000.00 }
    ],
    requirements: [
      "Formulate a WITH block named `stats` that aggregates a column average named `overall_avg`.",
      "Merge parent transaction tables with the stats segment using a CROSS JOIN.",
      "Filter out any records where amount is less than or equal to stats overall_avg."
    ],
    hints: [
      "Use 'WITH stats AS (SELECT AVG(amount) as overall_avg FROM transactions)' as your CTE.",
      "Cross joining the single-row CTE extends the overall_avg value to all raw rows, making simple comparison possible.",
      "The WHERE conditions should check if `amount` is strictly greater than `overall_avg`."
    ],
    correctSolution: `WITH stats AS (
  SELECT AVG(amount) as overall_avg FROM transactions
)
SELECT 
  t.tx_id, 
  t.customer_id, 
  t.amount, 
  s.overall_avg
FROM transactions t
CROSS JOIN stats s
WHERE t.amount > s.overall_avg;`,
    discussion: {
      worksExplanation: "Creating a WITH CTE computes the aggregated average once. A cross join makes this single variable available on all transitional rows to filter them in the parent WHERE clause.",
      commonMistakes: "Using correlated subqueries inside the WHERE block, which can cause severe performance issues.",
      performance: "Since the CTE produces a single row, the CROSS JOIN has O(N) complexity, making it extremely fast."
    }
  },
  "W2-D2": {
    id: "W2-D2",
    riddleTitle: "The Olympic Podium",
    difficulty: "Medium",
    businessContext: "The sports organization board wants to rank match athletes across distinct game segments without leaving gaps in podium ranking numbers.",
    objective: "Assign dynamic, matched rank dimensions partitioned by game IDs and ordered with highest scorer placing first.",
    schemaTableName: "raw_scores",
    schemaColumns: [
      { name: "game_id", type: "INT", description: "Match tournament ID" },
      { name: "athlete_id", type: "INT", description: "Competitor profile ID" },
      { name: "department_id", type: "INT", description: "Organizational sector key" },
      { name: "score", type: "INT", description: "Final official performance rating score" }
    ],
    createTableSql: `CREATE TABLE raw_scores (
  game_id INT,
  athlete_id INT,
  department_id INT,
  score INT
);`,
    sampleData: [
      { game_id: 1001, athlete_id: 99, score: 98 },
      { game_id: 1001, athlete_id: 88, score: 98 },
      { game_id: 1001, athlete_id: 77, score: 90 },
      { game_id: 1002, athlete_id: 66, score: 100 },
      { game_id: 1002, athlete_id: 55, score: 92 }
    ],
    expectedOutput: [
      { game_id: 1001, athlete_id: 99, score: 98, score_rank: 1 },
      { game_id: 1001, athlete_id: 88, score: 98, score_rank: 1 },
      { game_id: 1001, athlete_id: 77, score: 90, score_rank: 2 },
      { game_id: 1002, athlete_id: 66, score: 100, score_rank: 1 },
      { game_id: 1002, athlete_id: 55, score: 92, score_rank: 2 }
    ],
    requirements: [
      "Compute a continuous rank aliased as `score_rank`.",
      "Partition the ranks by game_id so athletes only compete within their matches.",
      "Sort scores highest-to-lowest (descending) within each partition match."
    ],
    hints: [
      "Use the window function DENSE_RANK() OVER (...) rather than ROW_NUMBER() or RANK().",
      "Do not forget to specify PARTITION BY game_id to isolate matches.",
      "Add ORDER BY score DESC inside the OVER() statement."
    ],
    correctSolution: `SELECT 
  game_id, 
  athlete_id, 
  score,
  DENSE_RANK() OVER (
    PARTITION BY game_id 
    ORDER BY score DESC
  ) as score_rank
FROM raw_scores;`,
    discussion: {
      worksExplanation: "DENSE_RANK() assigns ranks without gaps, so identical scores receive the same rank and the next score gets the subsequent rank number.",
      commonMistakes: "Using RANK() which skips sequential rankings on tie matches, or forgetting DESC inside OVER().",
      performance: "Window functions are optimized inside modern SQL planners, but partition columns benefit from indices."
    }
  },
  "W2-D3": {
    id: "W2-D3",
    riddleTitle: "The Crypto Spike",
    difficulty: "Hard",
    businessContext: "A high-frequency financial tracking desk is searching timeseries logs for extreme single-day asset price spikes.",
    objective: "Identify trade dates where an asset closing price was strictly higher than its previous calendar trading day's closing price.",
    schemaTableName: "daily_stock_prices",
    schemaColumns: [
      { name: "ticker", type: "VARCHAR(20)", description: "Asset market ticker shortcut symbol" },
      { name: "trade_date", type: "DATE", description: "Trading market date" },
      { name: "close_price", type: "DECIMAL(12,4)", description: "Official final market close price" }
    ],
    createTableSql: `CREATE TABLE daily_stock_prices (
  ticker VARCHAR(20),
  trade_date DATE,
  close_price DECIMAL(12,4)
);`,
    sampleData: [
      { ticker: "BTC", trade_date: "2026-01-01", close_price: 45000.0000 },
      { ticker: "BTC", trade_date: "2026-01-02", close_price: 48000.0000 },
      { ticker: "BTC", trade_date: "2026-01-03", close_price: 47000.0000 },
      { ticker: "BTC", trade_date: "2026-01-04", close_price: 51200.0000 }
    ],
    expectedOutput: [
      { ticker: "BTC", trade_date: "2026-01-02", close_price: 48000.0000, previous_close: 45000.0000 },
      { ticker: "BTC", trade_date: "2026-01-04", close_price: 51200.0000, previous_close: 47000.0000 }
    ],
    requirements: [
      "Access previous daily close prices using LAG() over ticker partitions.",
      "Ensure records are correctly ordered by trade_date ascending inside window specifications.",
      "Filter results to show only spikes where close_price > previous_close."
    ],
    hints: [
      "Since window values can't be used directly in WHERE, wrap your query in a CTE or subquery first.",
      "The LAG expression should partition by ticker and order by trade_date ASC.",
      "Filter where close_price is strictly greater than the computed previous close."
    ],
    correctSolution: `WITH prev_day AS (
  SELECT 
    ticker, 
    trade_date, 
    close_price,
    LAG(close_price, 1) OVER (
      PARTITION BY ticker 
      ORDER BY trade_date ASC
    ) as previous_close
  FROM daily_stock_prices
)
SELECT 
  ticker, 
  trade_date, 
  close_price, 
  previous_close
FROM prev_day
WHERE close_price > previous_close;`,
    discussion: {
      worksExplanation: "Creating a subquery or CTE aggregates window values first. The parent query can then reference the LAG output columns to isolate price spikes.",
      commonMistakes: "Using LAG inside the WHERE clause directly, which violates SQL execution order constraints.",
      performance: "Ensure the index incorporates the partitioning and ordering columns: (ticker, trade_date)."
    }
  },
  "W2-D4": {
    id: "W2-D4",
    riddleTitle: "The Legacy Cleanup",
    difficulty: "Easy",
    businessContext: "An operations team has exported CRM lists from retired legacy platforms. The data contains dirty, inconsistent formatting.",
    objective: "Create a transformation query to clean registry codes, parse regions, and default missing email addresses.",
    schemaTableName: "legacy_contacts",
    schemaColumns: [
      { name: "contact_id", type: "INT", description: "Primary contact index identifier" },
      { name: "raw_phone", type: "VARCHAR(50)", description: "Unformatted string phone numbers" },
      { name: "raw_email", type: "VARCHAR(150)", description: "Incomplete user emails containing nulls" },
      { name: "registry_code", type: "VARCHAR(100)", description: "Untrimmed, mixed-case region keys" }
    ],
    createTableSql: `CREATE TABLE legacy_contacts (
  contact_id INT,
  raw_phone VARCHAR(50),
  raw_email VARCHAR(150),
  registry_code VARCHAR(100)
);`,
    sampleData: [
      { contact_id: 1, raw_phone: " 988-122 ", raw_email: "athila@google.com", registry_code: "   ap-south_9  " },
      { contact_id: 2, raw_phone: " 123-456 ", raw_email: null, registry_code: "  Us-east_12 " }
    ],
    expectedOutput: [
      { contact_id: 1, clean_code: "AP-SOUTH_9", region_code: "AP-", clean_email: "athila@google.com" },
      { contact_id: 2, clean_code: "US-EAST_12", region_code: "US-", clean_email: "NO_EMAIL_ON_RECORD" }
    ],
    requirements: [
      "Trim whitespaces from registry_code and convert it to uppercase.",
      "Extract the first 3 characters of the trimmed, uppercase code as region_code.",
      "Use COALESCE to replace null raw_email inputs with 'NO_EMAIL_ON_RECORD'."
    ],
    hints: [
      "Use UPPER(TRIM(registry_code)) to standardize codes.",
      "Use SUBSTRING(UPPER(TRIM(registry_code)), 1, 3) to extract region prefixes.",
      "COALESCE checks arguments sequentially, returning the first non-null value."
    ],
    correctSolution: `SELECT 
  contact_id,
  UPPER(TRIM(registry_code)) as clean_code,
  SUBSTRING(UPPER(TRIM(registry_code)), 1, 3) as region_code,
  COALESCE(raw_email, 'NO_EMAIL_ON_RECORD') as clean_email
FROM legacy_contacts;`,
    discussion: {
      worksExplanation: "Standardizing string functions ensures clean formatting. COALESCE aggregates null indicators to prevent application failures on missing email inputs.",
      commonMistakes: "Omitting TRIM before measuring character offsets can lead to extracting empty whitespaces.",
      performance: "String functions execute per row. It is faster to clean and index data during ingest stages."
    }
  },
  "W2-D5": {
    id: "W2-D5",
    riddleTitle: "The Inventory Sync",
    difficulty: "Hard",
    businessContext: "The warehousing system receives nightly batch delta updates. They need to reconcile target inventory items with the latest updates.",
    objective: "Write a SQL MERGE statement to sync target inventory stock counts with source updates, appending missing products.",
    schemaTableName: "target_inventory / source_updates",
    schemaColumns: [
      { name: "product_id (target)", type: "INT", description: "Unique catalog product ID" },
      { name: "stock_count (target)", type: "INT", description: "Current inventory count" },
      { name: "product_id (source)", type: "INT", description: "Updated catalog product ID" },
      { name: "stock_count (source)", type: "INT", description: "Latest inventory count" }
    ],
    createTableSql: `CREATE TABLE target_inventory (
  product_id INT,
  stock_count INT
);

CREATE TABLE source_updates (
  product_id INT,
  stock_count INT
);`,
    sampleData: [
      { product_id: 801, stock_count: 50 },
      { product_id: 802, stock_count: 120 }
    ],
    expectedOutput: [
      { product_id: 801, stock_count: 75 },
      { product_id: 802, stock_count: 120 },
      { product_id: 803, stock_count: 220 }
    ],
    requirements: [
      "Match target and source updates on product_id keys.",
      "WHEN MATCHED: Update target stock_count with source stock_count.",
      "WHEN NOT MATCHED: Insert missing items into target_inventory."
    ],
    hints: [
      "Use standard SQL MERGE syntax with target 't' and source 's'.",
      "For matching records, use 'WHEN MATCHED THEN UPDATE SET t.stock_count = s.stock_count'.",
      "For missing records, use 'WHEN NOT MATCHED THEN INSERT (product_id, stock_count) VALUES (s.product_id, s.stock_count)'."
    ],
    correctSolution: `MERGE INTO target_inventory t
USING source_updates s
ON (t.product_id = s.product_id)
WHEN MATCHED THEN 
  UPDATE SET t.stock_count = s.stock_count
WHEN NOT MATCHED THEN 
  INSERT (product_id, stock_count) VALUES (s.product_id, s.stock_count);`,
    discussion: {
      worksExplanation: "A MERGE statement coordinates inserts and updates in a single atomic pass, eliminating the need to write separate loops for checks.",
      commonMistakes: "Omitting the matching keys alias or neglecting target attributes on insert blocks.",
      performance: "MERGE statements run much faster on matching keys when product_id columns are indexed."
    }
  },
  "W6-D2": {
    id: "W6-D2",
    riddleTitle: "The Window Function Challenge",
    difficulty: "Hard",
    businessContext: "Corporate analytics requests department reports identifying top performing teams for annual reward allocation.",
    objective: "Identify employees who rank amongst the top 2 highest earners within their departments using DENSE_RANK().",
    schemaTableName: "employees",
    schemaColumns: [
      { name: "employee_id", type: "INT", description: "Employee ID" },
      { name: "first_name", type: "VARCHAR(100)", description: "Employee first name" },
      { name: "department_id", type: "INT", description: "Department reference ID" },
      { name: "salary", type: "DECIMAL(12,2)", description: "Annual employee earnings" }
    ],
    createTableSql: `CREATE TABLE employees (
  employee_id INT,
  first_name VARCHAR(100),
  department_id INT,
  salary DECIMAL(12,2)
);`,
    sampleData: [
      { employee_id: 11, first_name: "John", department_id: 1, salary: 180000.00 },
      { employee_id: 12, first_name: "Sarah", department_id: 1, salary: 180000.00 },
      { employee_id: 13, first_name: "Mike", department_id: 1, salary: 150000.00 },
      { employee_id: 14, first_name: "Elena", department_id: 2, salary: 200000.00 },
      { employee_id: 15, first_name: "Roger", department_id: 2, salary: 190000.00 },
      { employee_id: 16, first_name: "Nico", department_id: 2, salary: 110000.00 }
    ],
    expectedOutput: [
      { employee_id: 11, first_name: "John", department_id: 1, salary: 180000.00, sal_rank: 1 },
      { employee_id: 12, first_name: "Sarah", department_id: 1, salary: 180000.00, sal_rank: 1 },
      { employee_id: 13, first_name: "Mike", department_id: 1, salary: 150000.00, sal_rank: 2 },
      { employee_id: 14, first_name: "Elena", department_id: 2, salary: 200000.00, sal_rank: 1 },
      { employee_id: 15, first_name: "Roger", department_id: 2, salary: 190000.00, sal_rank: 2 }
    ],
    requirements: [
      "Use DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) aliased as `sal_rank`.",
      "Filter the ranked dataset to include rows where sal_rank <= 2.",
      "Structure your solution using a Common Table Expression (CTE) for clarity."
    ],
    hints: [
      "First compute ranks inside a WITH block named ranked_emp.",
      "Query ranked_emp and use WHERE to filter results where sal_rank <= 2.",
      "Confirm that columns represent the final requested output layout."
    ],
    correctSolution: `WITH ranked_emp AS (
  SELECT 
    employee_id, 
    department_id, 
    salary,
    DENSE_RANK() OVER (
      PARTITION BY department_id 
      ORDER BY salary DESC
    ) as sal_rank
  FROM employees
)
SELECT 
  employee_id, 
  department_id, 
  salary, 
  sal_rank
FROM ranked_emp
WHERE sal_rank <= 2;`,
    discussion: {
      worksExplanation: "DENSE_RANK() groups items by department, sorting scores descending. Storing this output in a CTE allows filtering in subsequent queries.",
      commonMistakes: "Using RAND() or checking ranking columns directly within window blocks, which is not supported.",
      performance: "For maximum efficiency on massive datasets, index the partition and sorting columns: (department_id, salary DESC)."
    }
  }
};

export function getChallengeStructure(dayId: string, day: any): StructuredChallenge {
  if (CHALLENGE_STRUCTURES[dayId]) {
    return CHALLENGE_STRUCTURES[dayId];
  }

  // Robust Fallback Generator for other challenge states and languages (Python, Text)
  const isPython = day.riddleLanguage === "python";
  const isText = day.riddleLanguage === "text";
  
  return {
    id: day.id,
    riddleTitle: day.riddleTitle,
    difficulty: isText ? "Easy" : isPython ? "Medium" : "Hard",
    businessContext: `This business analytical pipeline drill checks proficiency in modern concepts covering ${day.focusTitle}.`,
    objective: `Complete the ${day.riddleLanguage.toUpperCase()} code parameters or architecture design requirements listed to resolve the pipeline riddle successfully.`,
    schemaTableName: isPython ? "dataset_inputs (DataFrame)" : "architectural_blueprint",
    schemaColumns: [
      { name: "item_id", type: "INT / STR", description: "Identifier matching processing row context" },
      { name: "payload", type: "VARCHAR / OBJECT", description: "Active business inputs being processed" }
    ],
    createTableSql: isPython 
      ? `# Load Pandas dataset:
import pandas as pd
df = pd.DataFrame([
  {"item_id": 101, "payload": "Record context target"},
  {"item_id": 102, "payload": "Metadata trace item"}
])`
      : `-- System representation:\n-- Primary component: ${day.focusTitle}\n-- Flow link: ${day.informaticaConcept} ➔ ${day.modernEquivalent}`,
    sampleData: [
      { item_id: 101, payload: "Record context target" },
      { item_id: 102, payload: "Metadata trace item" }
    ],
    expectedOutput: [
      { item_id: 101, status: "Validated", operation: day.focusTitle }
    ],
    requirements: [
      `Review task requirements for '${day.riddleTitle}'.`,
      "Synthesize solutions with high execution speed and low memory footprint.",
      "Ensure conditions handle edge boundaries and null references."
    ],
    hints: [
      "Familiarize yourself with the concept exploration steps described in the syllabus.",
      "Ensure syntax matches conventions of standard runtime engines.",
      "Check that your output formats align with requirements exactly."
    ],
    correctSolution: isPython
      ? `# Representative Python Pandas Solution
import pandas as pd
# Perform transformations
print("Pipeline complete successfully.")`
      : `/* Architectural Concept Solution Guide */\nDesign incorporates robust modern DE principles.`,
    discussion: {
      worksExplanation: "Following modular design paradigms guarantees that data pipelines scale efficiently across clusters.",
      commonMistakes: "Using slow nested loops instead of vectorized set operations.",
      performance: "Minimize data shuffling between partitions to achieve maximum execution speed."
    }
  };
}

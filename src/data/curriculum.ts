export interface CurriculumDay {
  id: string;
  date: string; // e.g. "June 15"
  dayOfWeek: string; // e.g. "Mon"
  weekIndex: number; // 1 to 6
  focusTitle: string; // Focus title
  bridgeTitle: string; // Informatica bridge title
  bridgeDetails?: string; // Explanation of the bridge
  informaticaConcept: string; // Informatica equivalent component
  modernEquivalent: string; // Modern code counterpart
  conceptExploration: string[]; // Bulleted breakdown (15-Min exploration)
  riddleTitle: string; 
  riddleText: string; // Riddle scenario
  riddlePlaceholder: string; // Initial placeholder text in code playground
  riddleLanguage: 'sql' | 'python' | 'text';
  links: { label: string; url: string }[];
  todos: string[];
}

export interface CurriculumWeek {
  weekNum: number;
  title: string;
  days: CurriculumDay[];
}

export const CURRICULUM_DATA: CurriculumWeek[] = [
  {
    weekNum: 1,
    title: "SQL Fundamentals",
    days: [
      {
        id: "W1-D1",
        date: "June 15",
        dayOfWeek: "Mon",
        weekIndex: 1,
        focusTitle: "Filter & Source Qualifier",
        bridgeTitle: "Source Qualifier Filter",
        informaticaConcept: "Filter Transformation / Source Qualifier Filter Property",
        modernEquivalent: "SQL WHERE Clause",
        bridgeDetails: "In Informatica, you drag a Filter transformation or write a query filter in the Source Qualifier's SQL Query attribute. In modern engineering, we use the sql WHERE clause to subset rows directly at source, saving compute bandwidth.",
        conceptExploration: [
          "The WHERE clause acts as a database-level index gatekeeper, restricting processing only to relevant rows.",
          "Syntax form: SELECT columns FROM table WHERE condition_1 AND condition_2;",
          "Comparison operators include '=', '<>', '!=', '<', '>', 'LIKE', 'IN', and 'BETWEEN'.",
          "Never filter after massive aggregates unless using HAVING; filter early to save memory and I/O footprint."
        ],
        riddleTitle: "The Rogue Executive",
        riddleText: "We have an employees table containing columns: employee_id, first_name, last_name, department_id, salary, hire_date.\nWrite a clean SQL query to identify all employees belonging to Department 10 with a salary strictly greater than 150,000, excluding any hired in the calendar year 2026. (Hire date is stored as a standard date/timestamp field, so you can filter using YEAR(hire_date) != 2026 or hire_date not between '2026-01-01' and '2026-12-31').",
        riddlePlaceholder: "-- Write SQL to solve 'The Rogue Executive'\nSELECT \n  employee_id, \n  first_name, \n  last_name, \n  salary\nFROM employees\nWHERE ",
        riddleLanguage: "sql",
        links: [
          { label: "LeetCode Database Track", url: "https://leetcode.com/problemset/database/" },
          { label: "W3Schools SQL Where Tutorial", url: "https://www.w3schools.com/sql/sql_where.asp" }
        ],
        todos: [
          "Read through the 15-Min Concept Exploration on SQL WHERE clauses",
          "Solve the 'Rogue Executive' Coding Riddle and submit to the Mentor",
          "Complete at least 3 basic SELECT LeetCode database exercises"
        ]
      },
      {
        id: "W1-D2",
        date: "June 16",
        dayOfWeek: "Tue",
        weekIndex: 1,
        focusTitle: "Expression & Router",
        bridgeTitle: "Output Ports Logic / Router",
        informaticaConcept: "Expression Custom Output Ports / Router Transformation",
        modernEquivalent: "SQL CASE WHEN Statement",
        bridgeDetails: "In Informatica, you route rows to different groups based on rules, or create output ports with IIF() statements. In SQL, this translates directly to CASE WHEN statements, creating conditional calculated columns dynamically.",
        conceptExploration: [
          "CASE WHEN evaluates search conditions sequentially and returns the value for the first true expression.",
          "If no conditions are met, it falls back to the ELSE statement. If ELSE is omitted, it yields NULL.",
          "Can be embedded inside SELECT lists, WHERE clauses, and even aggregations like SUM(CASE WHEN...).",
          "Avoid nested CASE statements; flat, sequential CASE WHENs are much easier to read and maintain."
        ],
        riddleTitle: "The Tiered Discount",
        riddleText: "We have a customers table with customer_id, annual_spend, and tenure_years. \nWrite a SQL query that generates a tiered category named 'customer_tier'. The tiers are defined as:\n- Spent > 10,000 and tenure > 5 years: 'Platinum Elite'\n- Spent > 5,000 and tenure > 3 years: 'Gold Preferred'\n- Spent > 1,000: 'Silver Active'\n- Anything else: 'Standard Client'\nReturn customer_id, annual_spend, and your computed customer_tier.",
        riddlePlaceholder: "-- Write CASE WHEN statement to categorize customer tier\nSELECT \n  customer_id, \n  annual_spend, \n  CASE \n    -- Your conditions here\n  END as customer_tier\nFROM customers;",
        riddleLanguage: "sql",
        links: [
          { label: "W3Schools SQL Case Tutorial", url: "https://www.w3schools.com/sql/sql_case.asp" }
        ],
        todos: [
          "Understand the IIF() to CASE WHEN mapping",
          "Complete 'The Tiered Discount' SQL snippet and submit for evaluation",
          "Practice CASE WHEN conditions with negative boundaries"
        ]
      },
      {
        id: "W1-D3",
        date: "June 17",
        dayOfWeek: "Wed",
        weekIndex: 1,
        focusTitle: "Aggregator",
        bridgeTitle: "Aggregator Group By Ports",
        informaticaConcept: "Aggregator Transformation (Group By checkbox option)",
        modernEquivalent: "SQL GROUP BY / HAVING Clause",
        bridgeDetails: "Selecting Group By checkboxes elements in an Informatica Aggregator partition your statistics. In SQL, this is represented by GROUP BY, and the conditional aggregation filtering is performed via HAVING.",
        conceptExploration: [
          "GROUP BY collapses rows into summary statistics (SUM, AVG, COUNT, MIN, MAX).",
          "The WHERE clause filters rows BEFORE aggregation. The HAVING clause filters computed rows AFTER aggregation.",
          "Every column in the SELECT list must either be in the GROUP BY list or be enclosed in an aggregate function.",
          "Ensure that your GROUP BY columns represent unique indices or categories to avoid accidental duplicates."
        ],
        riddleTitle: "The Suspect Accounts",
        riddleText: "Analyzing transactions, we have: bank_transactions with account_id, amount (positive is credit, negative is debit), transaction_id. \nWrite a SQL query to identify accounts that have strictly more than 5 transactions in total, AND whose total transaction amount sum is strictly greater than 20,000. Return account_id, transaction_count, and total_sum.",
        riddlePlaceholder: "-- Identify suspect accounts with aggregates and HAVING\nSELECT \n  account_id, \n  COUNT(*) as transaction_count, \n  SUM(amount) as total_sum\nFROM bank_transactions\nGROUP BY \n  account_id\nHAVING ",
        riddleLanguage: "sql",
        links: [
          { label: "SQLBolt Lesson on Aggregates & HAVING", url: "https://sqlbolt.com/lesson/select_queries_with_aggregates_pt_2" }
        ],
        todos: [
          "Compare the Informatica Aggregator port properties with SQL aggregates",
          "Solve 'The Suspect Accounts' with HAVING filter constraints",
          "Examine explain-plans comparing WHERE vs HAVING logic"
        ]
      },
      {
        id: "W1-D4",
        date: "June 18",
        dayOfWeek: "Thu",
        weekIndex: 1,
        focusTitle: "Joiner",
        bridgeTitle: "Joiner Transformation / Joins",
        informaticaConcept: "Joiner Transformation (Normal Join, Master Outer, Detail Outer, Full Outer)",
        modernEquivalent: "SQL INNER / LEFT / RIGHT / FULL OUTER JOINS",
        bridgeDetails: "Informatica Joiner mappings require a 'Master' and 'Detail' pipeline designation. In modern databases, the optimizer automatically figures out which table is the build vs probe table, so you simply write JOIN keywords with explicit keys.",
        conceptExploration: [
          "INNER JOIN returns rows only when there is a match in both active tables.",
          "LEFT JOIN returns all rows from the left table, with NULLs for missing right table matches.",
          "In modern code, master/detail sizing guides do not restrict database capability; rather, index optimization takes precedence.",
          "Always verify join key columns match in type to prevent slow performance or execution errors."
        ],
        riddleTitle: "The Ghost Users",
        riddleText: "We have two tables: users (user_id, username, signup_date) and orders (order_id, user_id, order_amount, order_date).\nWrite a SQL query to find users who have signed up but have zero orders placed. Return their user_id, username, and signup_date. Use a left join to align records and search for null references.",
        riddlePlaceholder: "-- Find users with 0 orders using LEFT JOIN and IS NULL\nSELECT \n  u.user_id, \n  u.username, \n  u.signup_date\nFROM users u\nLEFT JOIN orders o ON ",
        riddleLanguage: "sql",
        links: [
          { label: "Interactive SQL Joins Visualizer", url: "https://sql-joins.leopard.in.ua/" }
        ],
        todos: [
          "Map Informatica Master/Detail outer join roles to Left/Right SQL tables",
          "Develop 'The Ghost Users' join lookup query",
          "Review SQL Joins cheatsheet diagram"
        ]
      },
      {
        id: "W1-D5",
        date: "June 19",
        dayOfWeek: "Fri",
        weekIndex: 1,
        focusTitle: "Sorter & Rank",
        bridgeTitle: "Sorter & Rank Trans",
        informaticaConcept: "Sorter Transformation (Sorting Keys) / Rank Transformation (Top/Bottom ranking)",
        modernEquivalent: "SQL ORDER BY / LIMIT & Row Rank clauses",
        bridgeDetails: "Sorting ports inside Informatica sorts ascending or descending. Sorter components also enable deduplication. In SQL, this is standard ORDER BY combined with LIMIT or window rank structures.",
        conceptExploration: [
          "ORDER BY sorts rows based on one or more columns ascending (ASC) or descending (DESC).",
          "LIMIT (or TOP / FETCH FIRST in some dialects) truncates the returned output records.",
          "For partitioned ranks where you want the top N items per department, standard database rank structures are used.",
          "Sorting massive tables is computationally expensive. Always limit records or filter early before sorting."
        ],
        riddleTitle: "The Leaderboard",
        riddleText: "We have a products catalog: products containing product_id, product_name, category, total_revenue.\nWrite a SQL query to extract the top 3 highest-revenue products inside the 'Electronics' category. Return product_id, product_name, and total_revenue ordered from highest to lowest.",
        riddlePlaceholder: "-- Select top 3 products in Electronicsordered by revenue\nSELECT \n  product_id, \n  product_name, \n  total_revenue\nFROM products\nWHERE category = 'Electronics'\nORDER BY ",
        riddleLanguage: "sql",
        links: [
          { label: "Mode Analytics - SQL Order By Guide", url: "https://mode.com/sql-tutorial/sql-order-by/" }
        ],
        todos: [
          "Translate Sorter/Rank properties into SQL sorting expressions",
          "Solve 'The Leaderboard' sorting riddle",
          "Read SQL sorting performance index tips"
        ]
      },
      {
        id: "W1-D6",
        date: "June 20",
        dayOfWeek: "Sat",
        weekIndex: 1,
        focusTitle: "Weekend Sync",
        bridgeTitle: "Resume Reframing Monologue",
        informaticaConcept: "Mapplet / Pipeline Metadata description",
        modernEquivalent: "Translating Visual Mappings to Systems Logic Narratives",
        bridgeDetails: "Your 4-year Informatica career is a massive asset. Mapplets read precisely like modern code CTE definitions or complex modular SQL structures. Let's start phrasing it as structured software integrations.",
        conceptExploration: [
          "When explaining projects, reframe 'developed mappings, sessions, workflows' to 'designed and implemented distributed data ingest pipelines, orchestrations, and target state mergers.'",
          "Instead of 'used Joiner and Router transformations', talk about 'optimizing source qualifier join operations, streaming filter partitions, and state logic routing.'",
          "Data engineering managers want to hear about volume, SLAs, performance enhancements, and source-to-target optimization logic."
        ],
        riddleTitle: "Mock Interview Prep",
        riddleText: "Draft a 2-sentence explanation of what a Source Qualifier and Sorter transformation do using modern SQL terminology. Present this directly as if answering an interviewer who asks: 'How does your ETL experience relate to written SQL pipeline optimization?'",
        riddlePlaceholder: "Enter your answer here...",
        riddleLanguage: "text",
        links: [
          { label: "Data Engineering Resume Preparation Guide", url: "https://leetcode.com/discuss/career/" }
        ],
        todos: [
          "Rephrase LinkedIn profile headline to: 'Data Integration & Pipelines Engineer'",
          "Complete the Mock Interview Riddle response",
          "Review core mappings completed during the week"
        ]
      }
    ]
  },
  {
    weekNum: 2,
    title: "Advanced SQL",
    days: [
      {
        id: "W2-D1",
        date: "June 22",
        dayOfWeek: "Mon",
        weekIndex: 2,
        focusTitle: "Subqueries & CTEs",
        bridgeTitle: "Connected & Unconnected Lookups",
        informaticaConcept: "Connected Lookup / Unconnected Lookup / SQL override in Lookups",
        modernEquivalent: "Common Table Expressions (CTEs) & Subqueries",
        bridgeDetails: "Informatica Lookups fetch values from external tables based on matching parameters. In code-based pipelines, we build CTEs (WITH tables) or Subqueries, which modularize queries into clean, highly readable, and easily optimized steps.",
        conceptExploration: [
          "CTEs are initialized with the WITH clause, introducing virtual temporary tables for the query duration.",
          "Unlike nested subqueries, CTEs are evaluated in order and dramatically improve query readability.",
          "Unconnected Lookups (called parameter-by-parameter) can often run slow; nested CTE joins are much more vectorized.",
          "Use CTEs to segment heavy data stages: e.g., WITH filtered_source AS (SELECT...), aggregates AS (SELECT...)."
        ],
        riddleTitle: "The Multi-Layered Audit",
        riddleText: "We have clean transactions info: transactions (tx_id, customer_id, amount, tx_date). \nWrite a query using a single CTE to calculate the total average transaction amount in the table, and then select all transactions that are strictly above this average. Return tx_id, customer_id, amount, and average_amount in your output.",
        riddlePlaceholder: "-- Build a CTE to calculate average, then filter records above average\nWITH stats AS (\n  SELECT AVG(amount) as overall_avg FROM transactions\n)\nSELECT \n  t.tx_id, \n  t.customer_id, \n  t.amount, \n  s.overall_avg\nFROM transactions t\nCROSS JOIN stats s\nWHERE ",
        riddleLanguage: "sql",
        links: [
          { label: "LearnSQL CTE Tutorial", url: "https://learnsql.com/blog/what-is-cte/" }
        ],
        todos: [
          "Transition Lookout setups into SQL CTE schemas",
          "Construct 'The Multi-Layered Audit' query block",
          "Write nested subqueries vs CTE execution benchmarks"
        ]
      },
      {
        id: "W2-D2",
        date: "June 23",
        dayOfWeek: "Tue",
        weekIndex: 2,
        focusTitle: "Window Functions I",
        bridgeTitle: "Dynamic Rank Tracking",
        informaticaConcept: "Expression variables holding previous status to rank elements",
        modernEquivalent: "SQL Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK()",
        bridgeDetails: "To rank records inside Informatica, you use active Rank components (supporting only 1 rank dimension) or construct complex Expression ports with variables checking last state. Modern SQL Window functions do this dynamically with simple OVER() partitions.",
        conceptExploration: [
          "Window functions compute values over a partitioned group of rows without collapsing them into summary states.",
          "ROW_NUMBER() returns a strict unique sequential rank, even if items match in sorted value.",
          "RANK() skips numbers on matches, while DENSE_RANK() leaves zero gaps between rank numbers.",
          "Syntax style: RANK() OVER (PARTITION BY dept_id ORDER BY score DESC);"
        ],
        riddleTitle: "The Olympic Podium",
        riddleText: "We have athletes scores: raw_scores (game_id, athlete_id, department_id, score). \nWrite a query containing DENSE_RANK() that assigns rank orders named 'score_rank' partitioned by game_id, sorted highest score to lowest. Ensure matches don't skip values.",
        riddlePlaceholder: "-- Assign rank partitioned by game_id ordered by score descending\nSELECT \n  game_id, \n  athlete_id, \n  score,\n  DENSE_RANK() OVER ( \n    -- Your window partition here\n  ) as score_rank\nFROM raw_scores;",
        riddleLanguage: "sql",
        links: [
          { label: "SQLPad Window Functions Practice", url: "https://sqlpad.io/tutorial/sql-window-functions/" }
        ],
        todos: [
          "Examine variable-ports history alignment in Expression vs Window calculations",
          "Implement 'The Olympic Podium' DENSE_RANK statement",
          "Complete LeetCode Database Medium #178 Score Rankings"
        ]
      },
      {
        id: "W2-D3",
        date: "June 24",
        dayOfWeek: "Wed",
        weekIndex: 2,
        focusTitle: "Window Functions II",
        bridgeTitle: "Variable Ports Tracking History",
        informaticaConcept: "Expression transformation tracking previous row values using variables (v_prev_val)",
        modernEquivalent: "SQL LAG() and LEAD() Functions",
        bridgeDetails: "In Informatica, to compare the current row to the previous row, we declare custom variable ports, assigning the input port to the variable after evaluating comparisons (ordering the row values is strictly required!). Modern SQL uses LEAD and LAG to offset references automatically.",
        conceptExploration: [
          "LAG(column, offset) offsets backwards, fetching values from preceding rows within the partition scope.",
          "LEAD(column, offset) offsets forwards, fetching values from following rows within the partition scope.",
          "Both accept optional default values to replace NULLs when offsets fall outside table ranges.",
          "Extremely useful for timeseries analysis: finding sequential growth, change deltas, or tracking system metrics."
        ],
        riddleTitle: "The Crypto Spike",
        riddleText: "We have timeseries prices: daily_stock_prices (ticker, trade_date, close_price).\nWrite a query to locate trade days where the closing price was strictly higher than the prompt previous day. Return ticker, trade_date, close_price, previous_close_price, and dynamic percentage change. Use LAG() OVER (PARTITION BY ticker ORDER BY trade_date ASC).",
        riddlePlaceholder: "-- Compare daily closing price with previous price using LAG\nSELECT \n  ticker, \n  trade_date, \n  close_price,\n  LAG(close_price, 1) OVER (PARTITION BY ticker ORDER BY trade_date ASC) as previous_close\nFROM daily_stock_prices",
        riddleLanguage: "sql",
        links: [
          { label: "PostgreSQL LEAD/LAG Window Functions Manual", url: "https://www.postgresql.org/docs/current/functions-window.html" }
        ],
        todos: [
          "Connect Informatica (v_prev_val) variable ports to SQL LAG properties",
          "Write the code solution for 'The Crypto Spike' transaction tracker",
          "Review execution plans for ordered window functions"
        ]
      },
      {
        id: "W2-D4",
        date: "June 25",
        dayOfWeek: "Thu",
        weekIndex: 2,
        focusTitle: "Data Cleaning",
        bridgeTitle: "Informatica Custom Clean Ports",
        informaticaConcept: "LTRIM, RTRIM, SUBSTR, TO_DATE, ISNULL function blocks",
        modernEquivalent: "SQL TRIM(), SUBSTRING(), COALESCE(), CAST() Logic",
        bridgeDetails: "Pipeline source files are always loaded with formatting issues. Informatica relies on visual function modifiers inside expressions. Python and SQL use robust inline string, cast, and null coalescing expressions directly which run at scale.",
        conceptExploration: [
          "COALESCE(val_1, val_2, default) returns the first non-null argument, replacing nulls with structured defaults.",
          "SUBSTRING(text, start, length) slices clean string offsets.",
          "LOWER() and UPPER() standardize text capitalization, which is essential before join lookups.",
          "CAST(field AS DATE) parses string representations safely into core date formats."
        ],
        riddleTitle: "The Legacy Cleanup",
        riddleText: "We have dirty contact data: legacy_contacts (contact_id, raw_phone, raw_email, registry_code).\nCreate a clean extraction query that:\n- Trims whitespaces from registry_code and converts it to uppercase.\n- Uses COALESCE to yield the contact's email, falling back to 'NO_EMAIL_ON_RECORD' if null.\n- Extracts the first 3 characters of registry_code as 'region_code'.",
        riddlePlaceholder: "-- Clean legacy formatting in SQL\nSELECT \n  contact_id,\n  UPPER(TRIM(registry_code)) as clean_code,\n  SUBSTRING(UPPER(TRIM(registry_code)), 1, 3) as region_code,\n  COALESCE(raw_email, 'NO_EMAIL_ON_RECORD') as clean_email\nFROM legacy_contacts;",
        riddleLanguage: "sql",
        links: [
          { label: "W3Schools SQL NULL Functions (COALESCE, ISNULL)", url: "https://www.w3schools.com/sql/sql_isnull.asp" }
        ],
        todos: [
          "Align visual IIF(ISNULL(...)) statements with standard COALESCE structures",
          "Solve 'The Legacy Cleanup' formatting riddle",
          "Review date parsing cast errors inside SQL servers"
        ]
      },
      {
        id: "W2-D5",
        date: "June 26",
        dayOfWeek: "Fri",
        weekIndex: 2,
        focusTitle: "Target Load DML",
        bridgeTitle: "Target Tables Operations / Upsert",
        informaticaConcept: "Target Table Operation (Insert, Update, Upsert, Delete) / Update Strategy",
        modernEquivalent: "SQL MERGE, INSERT INTO ON CONFLICT DO UPDATE",
        bridgeDetails: "In Informatica, you flag records as DD_INSERT or DD_UPDATE inside an Update Strategy Transformation (based on lookups), routing them to target blocks. Modern DBMS code bases use SQL MERGE or upsert clauses (ON CONFLICT) to update or append in one atomic operation.",
        conceptExploration: [
          "The MERGE statement blends source & target tables by checking match keys.",
          "WHEN MATCHED THEN UPDATE: overrides outdated metrics with new dataset parameters.",
          "WHEN NOT MATCHED THEN INSERT: appends newborn customer instances directly.",
          "ON CONFLICT(unique_key) DO UPDATE SET... is a highly fast, indexing-optimized PostgreSQL-style upsert query."
        ],
        riddleTitle: "The Inventory Sync",
        riddleText: "We have targeted target_inventory and source_updates containing product_id, stock_count, last_updated.\nWrite a unified MERGE matching target t and source s on product_id.\n- When matching, update t.stock_count with s.stock_count.\n- When not matched, append a fresh record containing s.product_id and s.stock_count.",
        riddlePlaceholder: "-- Write a comprehensive SQL MERGE block\nMERGE INTO target_inventory t\nUSING source_updates s\nON (t.product_id = s.product_id)\nWHEN MATCHED THEN \n  UPDATE SET t.stock_count = s.stock_count\nWHEN NOT MATCHED THEN \n  INSERT (product_id, stock_count) VALUES (s.product_id, s.stock_count);",
        riddleLanguage: "sql",
        links: [
          { label: "Microsoft SQL MERGE Statement Reference", url: "https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql" }
        ],
        todos: [
          "Transition Informatica Update Strategy (DD_UPDATE) systems to written MERGE SQL",
          "Write the sync query to align products stocks",
          "Readupsert vs individual insert-then-update performance comparisons"
        ]
      },
      {
        id: "W2-D6",
        date: "June 27",
        dayOfWeek: "Sat",
        weekIndex: 2,
        focusTitle: "IBM Mock Exam",
        bridgeTitle: "Timed Certification Warm-Up",
        informaticaConcept: "Session Error Limit thresholds and workflow control",
        modernEquivalent: "Advanced Query Performance & Assessment",
        conceptExploration: [
          "This completes the SQL track! Today you take a 45-min practice mock assessment covering SQL JOIN optimization, aggregates, window functions, and subquery schemas.",
          "Treat visual designs as structured logic steps inside your head. You have the baseline; let's execute with focus."
        ],
        riddleTitle: "IBM Assessment Blueprint",
        riddleText: "Describe your strategy for tuning a heavy JOIN between a 50M-row table and a 1M-row table when the current written ETL run is timing out. Reframe your answer to leverage core index alignments and query planning rather than simple Informatica Session optimizations.",
        riddlePlaceholder: "Explain your indexing, aggregation-before-joining, or hashing strategy...",
        riddleLanguage: "text",
        links: [
          { label: "LeetCode Database Assessment Index", url: "https://leetcode.com/problemset/database/" }
        ],
        todos: [
          "Complete the 45-minute independent database mock challenge",
          "Submit your architectural design approach to the Rogue Join Riddle",
          "Set up week-3 workspace structures of Core Python"
        ]
      }
    ]
  },
  {
    weekNum: 3,
    title: "Core Python",
    days: [
      {
        id: "W3-D1",
        date: "June 29",
        dayOfWeek: "Mon",
        weekIndex: 3,
        focusTitle: "Variables",
        bridgeTitle: "Input / Output / Variable Ports",
        informaticaConcept: "Local Variables / Input & Output Ports data-type alignments",
        modernEquivalent: "Python primitive variables, Type Casting, and String Formatting",
        bridgeDetails: "Variables are properties storing data. In Informatica, ports hold string, decimal, or date. Python manages variables dynamically; simply state var = value without strict configurations, although keeping types clean is vital.",
        conceptExploration: [
          "Python automatically determines variable typings dynamically (Duck Typing).",
          "Standard primitives include: integer (int), float, string (str), and boolean (bool; True/False).",
          "Python f-strings f'text {variable}' offer clean, readable variable injection in logs and paths.",
          "Use type casting functions: int('25') or str(10.5) to align formatted variables."
        ],
        riddleTitle: "The System Logger",
        riddleText: "We are building an orchestration alert script.\nCreate a small Python snippet containing three variables: env (string), batch_id (integer), and average_latency (float).\nWrite code to print a single f-string showing alerts exactly formatted like:\n'ALERT: Env [PRODUCTION] Batch ID #5931 succeeded with latency of 14.5ms.'\nEnsure you uppercase the env variable in your output print statement.",
        riddlePlaceholder: "# Setup variables and print a formatted logging string\nenv = \"production\"\nbatch_id = 5931\naverage_latency = 14.532\n\n# Your code here to print precisely the requested ALERT string\n",
        riddleLanguage: "python",
        links: [
          { label: "Python.org Introductory Tutorial", url: "https://docs.python.org/3/tutorial/introduction.html" }
        ],
        todos: [
          "Familiarize with Python primitives versus IDMC variable ports",
          "Complete the System Logger print assignment",
          "Execute basic variable assignments in terminal python shell"
        ]
      },
      {
        id: "W3-D2",
        date: "June 30",
        dayOfWeek: "Tue",
        weekIndex: 3,
        focusTitle: "Loops & Conditionals",
        bridgeTitle: "Row Engine / Router Conditions",
        informaticaConcept: "Router Transformation Groups / Rows Processing Iteration",
        modernEquivalent: "Python If-Else blocks & For Loops",
        bridgeDetails: "Informatica has a built-in session loop engine: it reads a source row, processes it through active mappings, and writes it. In Python, you author the loops (e.g. for row in dataset) and routing paths (if condition: else:) explicitly.",
        conceptExploration: [
          "For loops execute a block of instructions sequentially over ranges or collection arrays.",
          "If / elif / else blocks match boolean states, defining row routing paths.",
          "Ensure loop exits exist (avoid nested while-loops) to prevent pipeline hangs.",
          "Indentation in Python acts as curly braces or block gates. Always use 4 spaces strictly."
        ],
        riddleTitle: "The FizzBuzz Ingestion Filter",
        riddleText: "We are processing raw incoming stream logs represented by numbers 1 through 20. \nCreate a Python loop routing each step as follows:\n- If divisible by both 3 and 5, print 'Quarantine' (Critical system warning).\n- If divisible only by 3, print 'Drop' (Useless record).\n- If divisible only by 5, print 'DLQ' (Dead Letter Queue routing).\n- For anything else, print the string 'Pass'.",
        riddlePlaceholder: "# Write loop routing numbers 1 to 20 based on conditions\nfor num in range(1, 21):\n    if num % 3 == 0 and num % 5 == 0:\n        print(\"Quarantine\")\n    # Elif blocks go here...\n",
        riddleLanguage: "python",
        links: [
          { label: "RealPython Conditional Control Flows", url: "https://realpython.com/python-conditional-statements/" }
        ],
        todos: [
          "Convert Router conditions from Informatica symbols into python if-elif statements",
          "Solve 'The FizzBuzz Ingestion Filter' script",
          "Practice list collection ranges loops"
        ]
      },
      {
        id: "W3-D3",
        date: "July 01",
        dayOfWeek: "Wed",
        weekIndex: 3,
        focusTitle: "Collections & Dicts",
        bridgeTitle: "Parameter Files & Sets",
        informaticaConcept: "Session Parameter Files containing runtime variables ($$Param)",
        modernEquivalent: "Python Lists, Sets, and Dictionaries",
        bridgeDetails: "Informatica parameter files store flat key/value pairs used inside workflow sessions. In Python, dictionaries are powerful nested data structures (keys matching complex arrays or sets) used constantly to map records, translate references, and config runs.",
        conceptExploration: [
          "Lists: Ordered, mutable collections (e.g. columns = ['id', 'name']).",
          "Dictionaries: Structured key-value stores (e.g. config = {'host': 'localhost', 'port': 5432}).",
          "Sets: Unordered, unique collections. Perfect for quick deduplication of primary keys.",
          "Dict values can be accessed efficiently using config.get('key', default) preventing crashes."
        ],
        riddleTitle: "The Config Parser",
        riddleText: "We have an orchestration nested parameters dictionary:\nconfig = {'databases': [{'db_name': 'analytics', 'port': 5432}, {'db_name': 'stg', 'port': 5433}]}\nWrite a Python script that iterates through this list of databases and prints out each connection alert string precisely as follows:\n'Connecting to analytics on port 5432'\n'Connecting to stg on port 5433'",
        riddlePlaceholder: "config = {\n  'databases': [\n    {'db_name': 'analytics', 'port': 5432},\n    {'db_name': 'stg', 'port': 5433}\n  ]\n}\n# Loop through databases list inside config dict and print details\nfor db in config['databases']:\n    print(f\"Connecting to {db['db_name']} on port {db['port']}\")",
        riddleLanguage: "python",
        links: [
          { label: "W3Schools Python Dictionaries Tutorial", url: "https://www.w3schools.com/python/python_dictionaries.asp" }
        ],
        todos: [
          "Map flat Informatica $$Parameters configuration structures to nested python lists & dict objects",
          "Execute 'The Config Parser' iterable dictionary loop",
          "Review unique values extraction with python Sets"
        ]
      },
      {
        id: "W3-D4",
        date: "July 02",
        dayOfWeek: "Thu",
        weekIndex: 3,
        focusTitle: "Functions",
        bridgeTitle: "User-Defined Functions (UDFs)",
        informaticaConcept: "User-Defined Functions / Custom Formula Blocks",
        modernEquivalent: "Python Custom Functions (def) & arguments passing",
        bridgeDetails: "To reuse logic in Informatica, you configure User-Defined Functions (UDFs). In python, we construct reusable functions using the def keyword, which can process variable arguments, return clean objects, and raise alerts dynamically.",
        conceptExploration: [
          "Functions abstract logic blocks: def clean_phone(phone_str, default_region):.",
          "Accept parameters, evaluate inside local variable namespaces, and return formatted calculations.",
          "Keep functions highly focused: one single responsibility (D.O.N.O.T. Repeat Yourself).",
          "Declare default argument value states to enhance modular pipeline configurations."
        ],
        riddleTitle: "The File Timestamp Cleaner",
        riddleText: "We must generate clean, standard file naming states daily.\nWrite a python function named format_filename that accepts two arguments: prefix_name (string) and file_date (string, e.g. '2026-06-15').\nIt should return a single string combining both lowercased, with dots replaced by underscores, terminating with '.csv'.\nExample: format_filename('Stg.Orders', '2026-06-15') -> 'stg_orders_2026-06-15.csv'.",
        riddlePlaceholder: "def format_filename(prefix_name, file_date):\n    # Replace dots, lowercase, and return combined string\n    clean_prefix = prefix_name.lower().replace('.', '_')\n    return f\"{clean_prefix}_{file_date}.csv\"\n",
        riddleLanguage: "python",
        links: [
          { label: "RealPython Custom Python Functions Guide", url: "https://realpython.com/defining-your-own-python-function/" }
        ],
        todos: [
          "Translate visual IDMC customized UDF formulas to python function definitions",
          "Author and check the dynamic format_filename script",
          "Read best practices on docstrings and parameters typings"
        ]
      },
      {
        id: "W3-D5",
        date: "July 03",
        dayOfWeek: "Fri",
        weekIndex: 3,
        focusTitle: "Error Handling",
        bridgeTitle: "Session Logs & Rejection Thresholds",
        informaticaConcept: "Session Reject Limit (Error thresholds) / Row rejection to Bad File",
        modernEquivalent: "Python Try-Except blocks for Pipeline Fault Tolerance",
        bridgeDetails: "During Informatica sessions, when records have type parsing failures, they are filtered out to bad tables, or the run exits if the Error Limit is crossed. Python allows explicit exception capturing via Try-Except-Finally Blocks, preventing scripts from crashing.",
        conceptExploration: [
          "Try blocks guard fragile operations (e.g. database connect or type cast).",
          "Except specific_error capturing processes invalid row occurrences locally, writing logs safely without crashing the system.",
          "Raising custom errors allows custom parent workflow exceptions alerts configuration.",
          "Use the Finally block to guarantee critical cleanup tasks (like closing socket databases) execute."
        ],
        riddleTitle: "The Safe Calculator",
        riddleText: "We are processing records containing metric division percentages: numeric_pair_tuples = [(100, 2), (20, 0), (50, 5)].\nWrite a python loop iterating through numeric_pair_tuples, trying to divide item[0] by item[1].\nCapture ZeroDivisionError exceptions locally to append 'BAD_DIVISOR' to results list, and append success outcomes as float values. Return results.",
        riddlePlaceholder: "numeric_pair_tuples = [(100, 2), (20, 0), (50, 5)]\nresults = []\n\nfor val1, val2 in numeric_pair_tuples:\n    try:\n        # Write division attempt logic\n        results.append(val1 / val2)\n    except ZeroDivisionError:\n        results.append('BAD_DIVISOR')\n        \nprint(results)\n",
        riddleLanguage: "python",
        links: [
          { label: "Python documentation on try/except/errors", url: "https://docs.python.org/3/tutorial/errors.html" }
        ],
        todos: [
          "Connect IDMC reject logs config to native Python try/except loops",
          "Verify and submit the Safe Calculator arithmetic solution",
          "Examine standard python exception hierarchies"
        ]
      },
      {
        id: "W3-D6",
        date: "July 04",
        dayOfWeek: "Sat",
        weekIndex: 3,
        focusTitle: "Career Strategy",
        bridgeTitle: "Updating Online Portfolio Profiles",
        informaticaConcept: "Publishing mappings to visual repos",
        modernEquivalent: "LinkedIn Resume Data Keywords Integration",
        conceptExploration: [
          "Do not obscure your Informatica expertise. It proves robust analytical architecture capacity.",
          "Reframe your visual modeling tasks alongside core technical achievements. e.g.: 'Designed source query pipelines; optimized database execution; mapped migration paths into cloud lake systems using SQL and procedural routines.'",
          "Highlight transaction volumes, schema designs, and target table sync operations to show enterprise engineering experience."
        ],
        riddleTitle: "Enterprise Resume Builder",
        riddleText: "Choose one real development mapping you built in your previous job. Rephrase its description using 3-4 professional modern engineering terms (e.g., aggregate operations, data ingestion pipeline, transactional warehouse syncing, CTE mapping schemas).",
        riddlePlaceholder: "Reframe your previous project details dynamically...",
        riddleLanguage: "text",
        links: [
          { label: "Modern Data Professional Profile Builders", url: "https://mode.com/" }
        ],
        todos: [
          "Inject Python and advanced SQL terms adjacent to Informatica on resume sheets",
          "Submit updated previous job technical rephrase",
          "Prep week-4 workstation structures of Pandas Processing"
        ]
      }
    ]
  },
  {
    weekNum: 4,
    title: "Pandas Processing",
    days: [
      {
        id: "W4-D1",
        date: "July 06",
        dayOfWeek: "Mon",
        weekIndex: 4,
        focusTitle: "DataFrames",
        bridgeTitle: "Source Flat Files / DB Stages",
        informaticaConcept: "Flat File Connection Definition / Source Qualifier Stage",
        modernEquivalent: "Pandas DataFrames, read_csv(), read_json(), and inspection methods",
        bridgeDetails: "Instead of configuring connection managers to select CSV shapes, Pandas loads flat tables into 'DataFrames' (in-memory grid tables). Programmatic DataFrame functions allow instant structural analysis, datatype queries, and missing checks.",
        conceptExploration: [
          "Pandas is imported as: import pandas as pd.",
          "Loading standard pipelines: df = pd.read_csv('filepath.csv').",
          "Inspect structure layouts efficiently using: df.info(), df.describe(), df.head().",
          "Query active shape matrix values using df.shape directly."
        ],
        riddleTitle: "The Instant Visualizer",
        riddleText: "We have loaded a pandas dataframe containing mock transactions data. \nWrite 3 standard pandas commands to output:\n1. The datatypes of each column.\n2. The shape dimensions of the dataframe.\n3. The total missing/null values inside every distinct field element.",
        riddlePlaceholder: "# Write standard inspection pandas codes\n# df points to transactions DataFrame\nprint(df.dtypes)\nprint(df.shape)\nprint(df.isnull().sum())",
        riddleLanguage: "python",
        links: [
          { label: "Pandas Official Documentation: Getting Started", url: "https://pandas.pydata.org/docs/getting_started/index.html" }
        ],
        todos: [
          "Understand how in-memory DataFrames align with standard Stage databases",
          "Solve 'The Instant Visualizer' structural query riddle",
          "Install Local Pandas frameworks for independent scripts testings"
        ]
      },
      {
        id: "W4-D2",
        date: "July 07",
        dayOfWeek: "Tue",
        weekIndex: 4,
        focusTitle: "Filtering",
        bridgeTitle: "Filter / Router Blocks",
        informaticaConcept: "Filter Transformation / Conditional Router mappings",
        modernEquivalent: "Pandas boolean indexing & numpy.where()",
        bridgeDetails: "Filtering columns based on complex conditions is executed through written indexing in Pandas. For complex, multi-group conditional calculated updates, we leverage np.where() which operates at vectorized speed across millions of rows.",
        conceptExploration: [
          "Filtering: df_filtered = df[df['salary'] > 120000] subsets records cleanly.",
          "Combine conditional filters using boolean operators: & (AND), | (OR), ~ (NOT).",
          "Vectorized conditional column creation syntax: df['tier'] = np.where(df['spend'] > 5000, 'VIP', 'Standard').",
          "Always wrap compound conditions in parentheses: df[(df['age'] > 30) & (df['status'] == 'Active')]."
        ],
        riddleTitle: "The High-Value Router",
        riddleText: "We have df containing columns client_id, country, and transaction_count.\nFilters records to select only clients residing in 'USA' who have strictly more than 10 transactions. Return the resulting filtered dataframe.",
        riddlePlaceholder: "# Apply pandas filtering condition for country and transaction_count\nusa_vip = df[(df['country'] == 'USA') & (df['transaction_count'] > 10)]\nprint(usa_vip)",
        riddleLanguage: "python",
        links: [
          { label: "NumPy Where Vectorization Reference Guide", url: "https://numpy.org/doc/stable/reference/generated/numpy.where.html" }
        ],
        todos: [
          "Translate visual Router logic nodes to NumPy/Pandas conditional filters",
          "Write the filtering statement code for US active transactions",
          "Review execution plans for vectorized masking vs loops"
        ]
      },
      {
        id: "W4-D3",
        date: "July 08",
        dayOfWeek: "Wed",
        weekIndex: 4,
        focusTitle: "Dataframe Merges",
        bridgeTitle: "Joiner Keys",
        informaticaConcept: "Joiner Keys alignment and Master pipeline configurations",
        modernEquivalent: "Pandas pd.merge() / DataFrame Join operations",
        bridgeDetails: "Aligning distinct source streams by primary keys is the specialty of the Joiner Transformation. In python, pd.merge handles inner, left, right, and full joins based on keys parameters in-memory.",
        conceptExploration: [
          "Merge syntax: pd.merge(df_left, df_right, on='key', how='left').",
          "Supports multi-column criteria keys using: on=['customer_id', 'group_id'].",
          "Outer joins generate NaN states on missing mappings. Clean standard null references following joins.",
          "Use suffixes parameter: suffixes=('_left', '_right') to segment duplicate column conflicts."
        ],
        riddleTitle: "The Orphaned Transaction Finder",
        riddleText: "We have customers_df (with customer_id, name) and transactions_df (with transaction_id, customer_id, amount).\nWrite a pd.merge statement to outer join customers_df with transactions_df on customer_id, with how='left', and find customers who have placed zero transactions (where transaction_id is null).",
        riddlePlaceholder: "# Merge tables and filter for null transaction rows\nmerged_df = pd.merge(customers_df, transactions_df, on='customer_id', how='left')\norphaned = merged_df[merged_df['transaction_id'].isna()]\nprint(orphaned)",
        riddleLanguage: "python",
        links: [
          { label: "Pandas Merge & Join Reference Manual", url: "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html" }
        ],
        todos: [
          "Analyze the structural parallel of Joiner transformations to Pandas tables merge",
          "Complete 'The Orphaned Transaction Finder' python script",
          "Test join performance using index lookups inside frames"
        ]
      },
      {
        id: "W4-D4",
        date: "July 09",
        dayOfWeek: "Thu",
        weekIndex: 4,
        focusTitle: "GroupBy Aggregations",
        bridgeTitle: "Aggregator Trans",
        informaticaConcept: "Aggregator ports grouping and computed functions calculations",
        modernEquivalent: "Pandas GroupBy & .agg() methods",
        bridgeDetails: "Calculating statistics per category requires Informatica Aggregator pipelines. In Pandas, df.groupby('column') combined with .agg() executes group calculations (SUM, mean, size) over target categories.",
        conceptExploration: [
          "GroupBy syntax: df.groupby('category')['revenue'].sum().",
          "Advanced grouping using dictionaries: .agg({'spend': 'sum', 'visits': 'mean', 'client_id': 'count'}).",
          "Use .reset_index() following GroupBy aggregations to restore a flat tabular DataFrame.",
          "Filter aggregate outcomes by normal slice queries across computed frames."
        ],
        riddleTitle: "The Store Performance Dashboard",
        riddleText: "We have transactions: df containing: store_id, sale_amount, and employee_id. \nWrite a pandas statement to group by store_id, calculating:\n1. The total sum of sale_amount.\n2. The count of unique employees (employee_id.nunique).\nEnsure you reset_index on final frame metrics.",
        riddlePlaceholder: "# Group by store_id and compute sum and unique employee counts\nstore_summary = df.groupby('store_id').agg({\n    'sale_amount': 'sum',\n    'employee_id': 'nunique'\n}).reset_index()\nprint(store_summary)",
        riddleLanguage: "python",
        links: [
          { label: "RealPython Pandas GroupBy Visual Tutorial", url: "https://realpython.com/pandas-groupby/" }
        ],
        todos: [
          "Align Aggregator visual portfolios with Pandas groupby dictionaries",
          "Solve 'The Store Performance Dashboard' challenge",
          "Compare SQL groupby performance vs in-memory python aggregates"
        ]
      },
      {
        id: "W4-D5",
        date: "July 10",
        dayOfWeek: "Fri",
        weekIndex: 4,
        focusTitle: "File Exporting",
        bridgeTitle: "Target Transformations",
        informaticaConcept: "Target flat file / warehouse tables connector mapping output",
        modernEquivalent: "Pandas to_csv(), to_parquet() and file serialization schemas",
        bridgeDetails: "To output results, Informatica routes datasets to target connectors. In python, we serialize DataFrames directly to disk with standard functions: df.to_csv('out.csv', index=False) or modern compressed format files like Parquet.",
        conceptExploration: [
          "Output clean CSVs: df.to_csv('output_path.csv', index=False). Omit write indices to keep schemas align.",
          "Parquet format: df.to_parquet('out.parquet') stores columnar data with heavy file compression benefits.",
          "Validate target constraints before outputting (e.g., verifying duplicates, trimming strings, checking NaN codes).",
          "Ensure parent write directory permissions exist prior to initialization triggers."
        ],
        riddleTitle: "The Pipeline Finale",
        riddleText: "We have raw sales data: sales_df. \nWrite a python cleaning sequence that:\n- Erases duplicated rows utilizing sales_df.drop_duplicates().\n- Drops any row where sales_amount is null using sales_df.dropna(subset=['sales_amount']).\n- Exports results index-free to file stage 'clean_sales_2026.csv'.",
        riddlePlaceholder: "# Write pipeline sequence and export as flat file\nclean_df = sales_df.drop_duplicates().dropna(subset=['sales_amount'])\nclean_df.to_csv('clean_sales_2026.csv', index=False)",
        riddleLanguage: "python",
        links: [
          { label: "Pandas DataFrame Exporting Documentation", url: "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_csv.html" }
        ],
        todos: [
          "Review file exporter configuration mappings to visual target files",
          "Complete 'The Pipeline Finale' script details",
          "Read compressed storage metrics (CSV vs Gzipped Parquet)"
        ]
      },
      {
        id: "W4-D6",
        date: "July 11",
        dayOfWeek: "Sat",
        weekIndex: 4,
        focusTitle: "IBM Mock Exam 2",
        bridgeTitle: "Advanced Systems Validation",
        informaticaConcept: "Session memory limits and caching configuration",
        modernEquivalent: "Pandas and SQL Combined Assessment",
        conceptExploration: [
          "This completes the Pandas processing framework! Today you execute a 60-min timed sync simulation.",
          "Focus on memory efficiency, mapping data types correctly, and troubleshooting joins logic. Visual mapping logic has been transitioned into programmatic structures!"
        ],
        riddleTitle: "Advanced SQL & Pandas Bridge Exam",
        riddleText: "Describe how you would translate an Informatica mapping that performs a Left Join, filters for missing keys, groups by a region code, and computes total spend, into a programmatic Pandas script.",
        riddlePlaceholder: "Outline your step-by-step Pandas operations (including merge, masking, groupby, and agg)...",
        riddleLanguage: "text",
        links: [
          { label: "Pandas DataFrame Merge Manual", url: "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html" }
        ],
        todos: [
          "Take the 60-minute combined coding challenge under timed guidelines",
          "Submit your step-by-step Pandas mapping algorithm design to the Mentor",
          "Plan Week 5 structures of Data Warehousing & Modern Stacks"
        ]
      }
    ]
  },
  {
    weekNum: 5,
    title: "Data Warehousing & Architecture",
    days: [
      {
        id: "W5-D1",
        date: "July 13",
        dayOfWeek: "Mon",
        weekIndex: 5,
        focusTitle: "Distributed Systems",
        bridgeTitle: "Grid Execution & Pushdown Optimization",
        informaticaConcept: "Grid Execution server configurations / Pushdown Optimization (PDO)",
        modernEquivalent: "Hadoop, Apache Spark, and Distributed Systems scaling",
        bridgeDetails: "To speed up sessions, Informatica pushes the computation to the source/target database using Pushdown Optimization (PDO) or distributes threads on an IDMC grid. Modern PySpark and Spark SQL engines act as a native distributed grid, processing massive tables across multiple cluster nodes.",
        conceptExploration: [
          "Standard single-machine systems (like default python) bottleneck on files >10GB.",
          "Distributed engines (Spark, Snowflake) split massive tables into segmented partitions managed across a cluster.",
          "Spark evaluates calculations using Lazy Evaluation: building a DAG query plan prior to executing transformations.",
          "PDO directly resembles written SQL compilation running on heavy Cloud databases (Google BigQuery, Snowflake)."
        ],
        riddleTitle: "The Architectural Tradeoff",
        riddleText: "An enterprise has a 50 Terabyte analytical table on-premise and needs daily dashboard metrics updates.\nAnalyze the architectural configurations. Explain why PySpark/Snowflake would be selected over custom on-premise single-engine python pandas scripts to prevent memory out-of-bounds (OOM) crashes.",
        riddlePlaceholder: "Draft your architectural scaling explanation here...",
        riddleLanguage: "text",
        links: [
          { label: "Databricks - Apache Spark Core Tutorials", url: "https://www.databricks.com/spark/about" }
        ],
        todos: [
          "Compare IDMC Pushdown (PDO) logic with modern Snowflake/Snowpark scaling",
          "Solve 'The Architectural Tradeoff' distributed system explanation riddle",
          "Read Spark partitions optimization guides"
        ]
      },
      {
        id: "W5-D2",
        date: "July 14",
        dayOfWeek: "Tue",
        weekIndex: 5,
        focusTitle: "Dimensional Modeling",
        bridgeTitle: "Target Star Schema Layouts",
        informaticaConcept: "Enterprise Warehouses Schema configurations and primary key targets",
        modernEquivalent: "Kimball Dimensional Modeling: Fact and Dimensions Tables",
        bridgeDetails: "Dimensional Modeling is the backbone of analytics database design. Mappings load transactional logs into organized Star schemas: 'Fact' tables (holding granular foreign keys & numerical metrics) joined to 'Dimension' tables (holding rich categorizations).",
        conceptExploration: [
          "Facts: Contain measurements, metrics, and quantitative values (e.g. sales_amount, quantity_sold). Fast-growing.",
          "Dimensions: Contain descriptive attributes, labels, names, and contexts (e.g. employee_details, store_profiles).",
          "Surrogate Keys: Unique integer primary keys generated internally by the warehouse to segment natural keys.",
          "Star Schema designs reduce deep Join redundancies, maximizing data query performance on heavy engines."
        ],
        riddleTitle: "The Ride-Hailing Blueprint",
        riddleText: "We are design modeling an analytical warehouse database for a ride-sharing service (similar to Uber).\nDraft an organized outline listing:\n1. 1 Fact table name and 3 numerical metric column examples.\n2. 2 related Dimension table names and 2 descriptive column attribute examples for each.",
        riddlePlaceholder: "1. FACT TABLE NAME:\n   - Metric columns:\n\n2. DIMENSION TABLES:\n   - Dimension 1:\n     columns:\n   - Dimension 2:\n     columns:",
        riddleLanguage: "text",
        links: [
          { label: "Kimball Group Dimensional Modeling Techniques Reference Index", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/" }
        ],
        todos: [
          "Analyze previous Informatica targets mapping designs using Kimball concepts",
          "Generate 'The Ride-Hailing Blueprint' Fact/Dimension database schema",
          "Review Star Schema vs Snowflake schema normalization structures"
        ]
      },
      {
        id: "W5-D3",
        date: "July 15",
        dayOfWeek: "Wed",
        weekIndex: 5,
        focusTitle: "SCD Type 2",
        bridgeTitle: "Slowly Changing Dimensions Mapping Blocks",
        informaticaConcept: "SCD Type 2 visual mappings (holding lookup, comparison, and updates strategies)",
        modernEquivalent: "SQL Slowly Changing Dimensions Type 2 / Historic Tracking",
        bridgeDetails: "SCD Type 2 maps historical changes by keeping multiple rows per business ID, tracked via start_date, end_date, and active_flag. In Informatica, this is a heavy baseline mapping sequence. In modern DW, we compute custom historic delta views or dbt modules.",
        conceptExploration: [
          "SCD Type 1 overrides data directly: zero historic records tracked.",
          "SCD Type 2 appends new rows upon edits, setting the active_flag of the previous record to False.",
          "Requires key criteria validations to align timestamps and isolate historical occurrences.",
          "dbt snapshots package this logic, tracking history automatically using database logs."
        ],
        riddleTitle: "The Job Title Tracker",
        riddleText: "A developer is tracking staff profiles over multiple years: columns (employee_id, job_title, start_date, end_date, is_active).\nAn employee edits their job_title from 'Data Analyst' to 'Senior Data Engineer'.\nExplain the exact rows operations (Update vs Insert) that must happen inside an SCD Type 2 table to track this mutation.",
        riddlePlaceholder: "Draft your step-by-step rows operation model detailing current active row expiration and new row insertions...",
        riddleLanguage: "text",
        links: [
          { label: "Data Warehouse slowly changing dimensions (SCD2) Overview", url: "https://www.datawarehouseinfo.com/slowly-changing-dimension-type-2/" }
        ],
        todos: [
          "Examine traditional IDMC SCD Type 2 mapping loops (Lookup -> Exp -> Router -> Target)",
          "Solve 'The Job Title Tracker' explanation scenario",
          "Review temporal tables standard database support features"
        ]
      },
      {
        id: "W5-D4",
        date: "July 16",
        dayOfWeek: "Thu",
        weekIndex: 5,
        focusTitle: "Modern ELT Stack",
        bridgeTitle: "ETL Servers vs In-Warehouse Processing",
        informaticaConcept: "ETL Engine processing resources / PowerCenter Servers",
        modernEquivalent: "Modern ELT Stack (dbt, SQL-Only transformations, Snowflake / BigQuery)",
        bridgeDetails: "Traditional ETL extracts data, transforms it on an Informatica engine server, and loads it to the target. Modern cloud computing scales on ELT: extract and load everything raw into a cloud data warehouse, then write modular query transformations using dbt (data build tool).",
        conceptExploration: [
          "ETL (Informatica server) is resource bottlenecked by server CPU configurations.",
          "ELT (dbt + Snowflake) leverages massive cloud scaling: transformations run as deep SQL operations directly on the database cluster.",
          "dbt allows SQL coders to build, document, test, and schedule SQL models following software engineering practices.",
          "Version control, CI/CD, and peer reviews are native to dbt, moving analytics teams from UI configurations to code repos."
        ],
        riddleTitle: "The Transformation Flip",
        riddleText: "An architect suggests migrating an Informatica SQL-Override mapping that performs massive joins and aggregations on a visual server into a BigQuery ELT sequence using dbt.\nOutline why this improves pipeline stability, speeds up execution times, and simplifies version control.",
        riddlePlaceholder: "Detail your ELT design reasoning, mentioning server compute offloading and git-driven workflows...",
        riddleLanguage: "text",
        links: [
          { label: "What is dbt? Official Introduction Manual", url: "https://docs.getdbt.com/docs/introduction" }
        ],
        todos: [
          "Understand the shift from Informatica Server-side processing to Warehouse Pushdown logic",
          "Complete 'The Transformation Flip' architectural critique",
          "Review basic dbt project structures online"
        ]
      },
      {
        id: "W5-D5",
        date: "July 17",
        dayOfWeek: "Fri",
        weekIndex: 5,
        focusTitle: "Pipeline Orchestration",
        bridgeTitle: "Workflows / Taskflows / Schedulers",
        informaticaConcept: "Workflows / Taskflows / Event Wait / Decision Task",
        modernEquivalent: "Orchestration Engines, Directed Acyclic Graphs (DAGs), Apache Airflow",
        bridgeDetails: "Informatica groups mappings inside Taskflows, executing sequentially or in parallel using visual Decision nodes and schedulers. Modern engineering configures Orchestration Pipelines as code, usually using Python DAG models in tools like Apache Airflow.",
        conceptExploration: [
          "Airflow coordinates pipelines as DAGs (Directed Acyclic Graphs): visual dependency maps of sequence steps.",
          "Every task in Airflow is code-defined (e.g. running a SQL script, pulling an API, triggering a Spark job).",
          "Features programmatic retries, robust error emailing, SLA monitoring, and dynamic pipeline generations.",
          "Enables easy modular orchestrations: if task_1 fails, route downstream blocks to quarantine alert operators."
        ],
        riddleTitle: "The Dependency Tree",
        riddleText: "We have four tasks: extract_orders, extract_customers, transform_sales, and load_warehouse.\nWrite a clean 2-line visual mock Airflow dependency sequence using Python operators '>>' or '<<' to ensure:\n- transform_sales only executes AFTER both extract_orders and extract_customers succeed.\n- load_warehouse executes AFTER transform_sales completes.",
        riddlePlaceholder: "# Mock task references: extract_orders, extract_customers, transform_sales, load_warehouse\n# Write the Airflow code dependencies\n[extract_orders, extract_customers] >> transform_sales >> load_warehouse",
        riddleLanguage: "python",
        links: [
          { label: "Astronomer Airflow Academy - DAG Writing Tutorials", url: "https://academy.astronomer.io/" }
        ],
        todos: [
          "Compare Taskflow visual sequence nodes with written Airflow dependency scripts",
          "Configure 'The Dependency Tree' Airflow task layout",
          "Read Airflow Task lifecycle states (Retrying, Schedulings)"
        ]
      },
      {
        id: "W5-D6",
        date: "July 18",
        dayOfWeek: "Sat",
        weekIndex: 5,
        focusTitle: "Code Portfolio Assembly",
        bridgeTitle: "Git Repositories structures",
        informaticaConcept: "Exporting mapping XML templates to shared directories",
        modernEquivalent: "GitHub Projects Presentation & Portfolio Build",
        conceptExploration: [
          "Visual XMLs cannot be peer-reviewed by managers. Having an active, organized GitHub portfolio with clean script codes is crucial.",
          "Create a repository showcasing: 1. Clean, documented SQL analysis queries (CTEs, Window operations) and 2. A modular Python database ingester (using Pandas, Try-Excepts, and OS configs).",
          "Provide rich README documentation detailing what each pipeline resolves, showcasing your architecture background."
        ],
        riddleTitle: "The README Pitch",
        riddleText: "Draft a concise 3-sentence summary introduction for a GitHub data project readme. Frame it as a modern data ingestion and storage pipeline, showcasing automated file parsing, error limits, and database upserts.",
        riddlePlaceholder: "Write a professional README abstract for your pipeline project...",
        riddleLanguage: "text",
        links: [
          { label: "GitHub portfolio checklist for modern data professionals", url: "https://mode.com/" }
        ],
        todos: [
          "Set up a GitHub account and configure a clean 'data-pipeline-portfolio' folder",
          "Author and submit your README project summary",
          "Prep week-6 workspace structures of Interview Campaigns"
        ]
      }
    ]
  },
  {
    weekNum: 6,
    title: "Interview Campaign",
    days: [
      {
        id: "W6-D1",
        date: "July 20",
        dayOfWeek: "Mon",
        weekIndex: 6,
        focusTitle: "Narrative Framing",
        bridgeTitle: "Reframer STAR Stories",
        informaticaConcept: "Visual flow explanations of source data mapping to Target paths",
        modernEquivalent: "Behavioral STAR Technique & Advanced Resume Dialogues",
        bridgeDetails: "Interviewers will ask behavioral scenarios. Map visual components directly to enterprise scaling. Explain design patterns using modern wording: aggregation, source join optimization, memory, and database pushdowns.",
        conceptExploration: [
          "STAR: Situation, Task, Action, Result. Crucial structure to outline answers.",
          "Describe heavy enterprise volumes: e.g. mapping 10M transactions, maintaining stringent 1-hour SLAs.",
          "State your code migration achievements: e.g. 'restructured legacy transformations into scalable warehouse modules.'",
          "Emphasize business value: saved 30% computing cost by offloading processing via SQL pushdown integrations."
        ],
        riddleTitle: "The STAR Reframe Challenge",
        riddleText: "An interviewer asks: 'Tell me about a time you resolved a performance bottleneck in a pipeline.'\nWrite a 4-sentence behavioral statement using STAR to outline your experience. Highlight data volumes, caching or index updates, and results in your description.",
        riddlePlaceholder: "Situation: ...\nTask: ...\nAction: ...\nResult: ...",
        riddleLanguage: "text",
        links: [
          { label: "Interview Prep Guide on STAR Methodology", url: "https://www.w3schools.com/" }
        ],
        todos: [
          "Review previous major production failures you successfully addressed",
          "Complete 'The STAR Reframe' scenario and submit for mentor feedback",
          "Practice key verbal STAR transitions aloud"
        ]
      },
      {
        id: "W6-D2",
        date: "July 21",
        dayOfWeek: "Tue",
        weekIndex: 6,
        focusTitle: "Technical Boardroom",
        bridgeTitle: "Live Query Design Warmups",
        informaticaConcept: "SQL Override attributes in lookups",
        modernEquivalent: "Interactive SQL Boardroom Practice & Complex Prompts",
        bridgeDetails: "During technical interviews, you will code live on a clean shared workspace sheet. Keep verbalizing your planning, review edge cases, state complexity constraints, and keep a cool head.",
        conceptExploration: [
          "First, identify unique keys and null expectations of input tables.",
          "State your plan: 'I'll define a CTA segment first to compute ranks, then outer join on key lists.'",
          "Write clean, standard SQL. Capitalize keywords (SELECT, JOIN, WHERE) to make reviews easy.",
          "Dry-run your syntax with mock row values to verify limits and range conditions."
        ],
        riddleTitle: "The Window Function Challenge",
        riddleText: "We have employees (employee_id, first_name, department_id, salary).\nWrite a SQL query utilizing DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) named 'sal_rank' to list all employees who place amongst the top 2 highest earners within their respective department.",
        riddlePlaceholder: "-- Find Top 2 salaries in each department using DENSE_RANK\nWITH ranked_emp AS (\n  SELECT \n    employee_id, \n    department_id, \n    salary,\n    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as sal_rank\n  FROM employees\n)\nSELECT * \nFROM ranked_emp\nWHERE sal_rank <= 2;",
        riddleLanguage: "sql",
        links: [
          { label: "LeetCode Database Assessment Track", url: "https://leetcode.com/problemset/database/" }
        ],
        todos: [
          "Examine partitioned analytics parallel patterns inside Informatica mappings",
          "Write and test 'The Window Function Challenge' code script",
          "Practice live syntax coding on plain text files without auto-complete"
        ]
      },
      {
        id: "W6-D3",
        date: "July 22",
        dayOfWeek: "Wed",
        weekIndex: 6,
        focusTitle: "Code Debugging",
        bridgeTitle: "Debugging Session Logs",
        informaticaConcept: "Reviewing session logs and reading error codes (FATAL, Severe)",
        modernEquivalent: "Python Troubleshooting, Tracebacks parser, and logic debugging",
        bridgeDetails: "Informatica has clear error prompts in Workflow Monitor. Modern scripting raises Python 'Tracebacks', showing file line numbers, call history, and error descriptions (e.g. TypeError, ValueError).",
        conceptExploration: [
          "Read Python crash blocks from bottom to top: the bottom line displays the exact raised error.",
          "ValueError: occurs on type mismatches (e.g., int('dirty_string')).",
          "IndexError: happens when indexing outside lists array bounds.",
          "KeyError: indicates searching for keys that are missing inside dictionaries."
        ],
        riddleTitle: "The Broken Pipeline",
        riddleText: "A developer writes a script parsing customer configurations:\nconfig = {'prod': {'host': '10.0.0.1'}, 'dev': {}}\nprint(config['dev']['host'])\nThis raises a KeyError ('host'). Rewrites this specific extraction line using the safe .get() method to return 'localhost' if missing.",
        riddlePlaceholder: "# Replace dirty dict accesses with safe get codes\nconfig = {'prod': {'host': '10.0.0.1'}, 'dev': {}}\n\n# Your code here to safely fetch dev host keys\nhost_ip = config.get('dev', {}).get('host', 'localhost')\nprint(host_ip)",
        riddleLanguage: "python",
        links: [
          { label: "RealPython Debugging Techniques & Loggers Guide", url: "https://realpython.com/" }
        ],
        todos: [
          "Correlate IDMC execution track tracing with standard Python Traceback lines",
          "Resolve 'The Broken Pipeline' dictionary fetch error",
          "Review classic SQL join null handling data problems"
        ]
      },
      {
        id: "W6-D4",
        date: "July 23",
        dayOfWeek: "Thu",
        weekIndex: 6,
        focusTitle: "System Architecture",
        bridgeTitle: "On-Premise to Cloud Lake migrations",
        informaticaConcept: "On-prem relational source mapping databases to dynamic target flat files",
        modernEquivalent: "Enterprise System Design & Serverless cloud loaders",
        bridgeDetails: "Engineering projects often migrate on-prem workflows into cloud storage. A classic interview challenge: how to design a scalable pipeline loading on-prem records into GCP bucket lakes and Snowflake tables.",
        conceptExploration: [
          "Extract: Extract on-prem DB changes into CSV/Parquet chunks using dynamic CDC (Change Data Capture) or queries.",
          "Load: Stream chunks safely through encryption protocols into cloud cloud lakes (e.g., Google Cloud Storage buckets).",
          "Transform: Automatically load stage records into Snowflake tables, running dbt models to transform dimensions.",
          "This scales infinitely better than running memory-intensive local transform engines!"
        ],
        riddleTitle: "Cloud Migration Map",
        riddleText: "An on-premise transactional postgres DB needs 500k row daily increments synchronizing to Google BigQuery.\nDraft an organized outline listing sequentially the 3 cloud components and operations that model this modern pipelines load.",
        riddlePlaceholder: "Step 1: Extract on-prem incremental records via...\nStep 2: Load binary Parquet blobs to GCS storage bucket using...\nStep 3: Trigger serverless BigQuery load and dbt compile models using...",
        riddleLanguage: "text",
        links: [
          { label: "Google Cloud Lakehouse Pipeline Architectures Hub", url: "https://cloud.google.com/architecture" }
        ],
        todos: [
          "Understand how on-premise visual pipelines translate to GCP/Snowflake systems",
          "Publish your three-tier Cloud Migration design outline",
          "Review classic CDC data synchronization approaches"
        ]
      },
      {
        id: "W6-D5",
        date: "July 24",
        dayOfWeek: "Fri",
        weekIndex: 6,
        focusTitle: "Network Activation",
        bridgeTitle: "Cold Pitch Elevator Speeches",
        informaticaConcept: "Submitting jobs templates to admins for reviews",
        modernEquivalent: "LinkedIn Outreach and Cold Pitches networking",
        conceptExploration: [
          "Do not sit back waiting for job advertisements. Proactively activate your system networks.",
          "Find local Engineering Managers on LinkedIn. Drop direct, respectful, and highly focused introductions.",
          "State your elite profile: 'I'm an enterprise Data Integration Engineer with 4 years migrating heavy analytics databases, specializing in SQL/Python and warehouse systems. Would love to contribute to your team.'",
          "Managers are looking for determined, experienced workers who speak enterprise pipeline architecture natively."
        ],
        riddleTitle: "The perfect Pitch",
        riddleText: "Write a polished 3-sentence introduction message designed to be dropped directly as a cold request to a Data Engineering Lead on LinkedIn. Pitch your Informatica database scaling expertise paired with your modern SQL/Python curriculum transition.",
        riddlePlaceholder: "Write your strategic LinkedIn networking pitch introduction...",
        riddleLanguage: "text",
        links: [
          { label: "LinkedIn Data Engineering Networking Strategies Hub", url: "https://www.linkedin.com/" }
        ],
        todos: [
          "Find 3 active Data Engineering Leads working in your sector region on LinkedIn",
          "Solve and customize 'The perfect Pitch' messaging introduction",
          "Review the core target metrics of interview campaigns"
        ]
      },
      {
        id: "W6-D6",
        date: "July 25",
        dayOfWeek: "Sat",
        weekIndex: 6,
        focusTitle: "IBM Final Dress Rehearsal",
        bridgeTitle: "Graduation Assessment Protocols",
        informaticaConcept: "Final job mappings packaging and promotion to Production staging",
        modernEquivalent: "Full Systems Final Exam & Certificate Evaluation",
        conceptExploration: [
          "This completes the final day of the 6-week elite transitions program! Outstanding effort.",
          "Today you perform a thorough, timed 90-minute dress simulation mapping directly to IBM's assessment matrix.",
          "You have built SQL expertise, Python variables control, Pandas DataFrames, Warehousing modeling, and interview STAR delivery. You are completely ready for this modern code-heavy career peak!"
        ],
        riddleTitle: "Elite Mentee Certification",
        riddleText: "Write a high-conviction personal pledge validating your readiness. In 4 sentences, state how your 4-year enterprise data warehousing expertise combined with your new writing skills equips you to build modern serverless systems better than fresh grads.",
        riddlePlaceholder: "Draft your high-energy career conviction statement...",
        riddleLanguage: "text",
        links: [
          { label: "IBM Interview Assessment Matrix reference metrics", url: "https://ibm.com/" }
        ],
        todos: [
          "Perform the thorough 90-minute timed final dress rehearsal",
          "Submit your Mentee Certification pledge to the Mentor",
          "Prepare your application letters for immediate market distribution"
        ]
      }
    ]
  }
];

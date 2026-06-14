export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DATA_ASSESSMENTS: { [dayId: string]: AssessmentQuestion[] } = {
  "W1-D1": [
    {
      id: "Q1",
      question: "Does a column alias created in SELECT work inside a WHERE clause?",
      options: [
        "Yes, standard SQL compiles and resolves aliases first.",
        "No, because the WHERE clause executes before the SELECT list compiles.",
        "Only if the database is running in a legacy ANSI strict compatibility mode.",
        "Yes, but you have to prefix the column with a colon or a hash symbol."
      ],
      correctIndex: 1,
      explanation: "No. SQL evaluates queries in the logical execution order of FROM -> WHERE -> GROUP BY -> HAVING -> SELECT. Because WHERE is evaluated before SELECT, the column aliases defined in SELECT do not exist yet!"
    },
    {
      id: "Q2",
      question: "What is the logical evaluation sequence in modern relational database engines?",
      options: [
        "SELECT -> WHERE -> FROM",
        "FROM -> WHERE -> SELECT",
        "WHERE -> FROM -> SELECT",
        "SELECT -> FROM -> WHERE"
      ],
      correctIndex: 1,
      explanation: "Relational query engines process tables and find subsets early. The FROM statement identifies data source, WHERE filters row states, and SELECT trims specific columns for output projection."
    },
    {
      id: "Q3",
      question: "Why should we prefer to filter row states early rather than using HAVING later?",
      options: [
        "To prevent aggregating rows that are ultimately discarded, saving aggregate engine RAM.",
        "Because HAVING is syntactically invalid unless backed by connected group-by ports.",
        "To enforce database isolation write-locks before transactions complete.",
        "There is no difference; query planners compile the instructions identically."
      ],
      correctIndex: 0,
      explanation: "Filtering early via WHERE reduces the volume of rows that must be processed, grouped in memory, or sorted, lowering aggregate memory overhead significantly."
    }
  ],
  "W1-D2": [
    {
      id: "Q1",
      question: "What happens if none of the CASE conditions are met and there is no ELSE clause specified?",
      options: [
        "The compilation will crash with a Syntax Exception.",
        "It defaults to the first condition's output.",
        "It returns NULL.",
        "It loops recursively until an adjacent match is found."
      ],
      correctIndex: 2,
      explanation: "If no conditions match and ELSE is omitted, SQL defaults to returning NULL. It is a best practice to always provide an explicit ELSE fallback."
    },
    {
      id: "Q2",
      question: "Which keyword is strictly required to close a standard CASE conditional expression?",
      options: [
        "END",
        "STOP",
        "TERMINATE",
        "EXIT"
      ],
      correctIndex: 0,
      explanation: "All SQL CASE expressions must terminate with the 'END' keyword."
    },
    {
      id: "Q3",
      question: "Can we embed a CASE WHEN clause inside an aggregation function like SUM?",
      options: [
        "Yes, doing so allows you to perform highly optimized conditional counting or summing (pivots).",
        "No, aggregation functions always execute on raw unmodified column metrics.",
        "Only when executing subqueries matched with Connected Lookups.",
        "Only in Python Pandas DataFrame frameworks, not in SQL."
      ],
      correctIndex: 0,
      explanation: "Using SUM(CASE WHEN condition THEN amount ELSE 0 END) is a classic data warehousing technique used to pivot rows into styled dashboard columns."
    }
  ],
  "W1-D3": [
    {
      id: "Q1",
      question: "In SQL, what is the core structural difference between WHERE and HAVING?",
      options: [
        "WHERE filters rows before aggregation; HAVING filters aggregated groups.",
        "WHERE requires index markers; HAVING works purely in temporary schema structures.",
        "HAVING operates on physical ports; WHERE operates on virtual ports.",
        "There is no functional difference; databases simply maintain both for backwards compatibility."
      ],
      correctIndex: 0,
      explanation: "WHERE filters rows BEFORE they are grouped. HAVING is evaluated AFTER the aggregation phase to filter computed groupings."
    },
    {
      id: "Q2",
      question: "If a column is selected in the SELECT block but not wrapped in an aggregate function, must it be in the GROUP BY?",
      options: [
        "No, the database automatically takes the first non-null record.",
        "Only if the column type is a string or a date timestamp.",
        "Yes, standard relational engines require any non-aggregated column to be in the GROUP BY.",
        "Only in Microsoft SQL Server, never in PostgreSQL or Databricks."
      ],
      correctIndex: 2,
      explanation: "If you select individual attributes along with aggregates, the relational engine needs to know how to cluster them; thus, all selected non-aggregate columns must be present in your GROUP BY clause."
    },
    {
      id: "Q3",
      question: "Which aggregate function would you use to calculate the total unique transaction counts?",
      options: [
        "COUNT(DISTINCT transaction_id)",
        "COUNT(UNIQUE transaction_id)",
        "SUM(transaction_id HAVING UNIQUE)",
        "DEDUPLICATE(COUNT(transaction_id))"
      ],
      correctIndex: 0,
      explanation: "COUNT(DISTINCT column_name) evaluates and records the exact number of non-duplicate values present inside a given dataset partition."
    }
  ],
  "W2-D1": [
    {
      id: "Q1",
      question: "Can you reference the same CTE definition multiple times within the primary query statement?",
      options: [
        "No, CTEs can only be read once per execution thread.",
        "Yes, CTEs act as reusable virtual tables during the query execution lifecycle.",
        "Only if you declare them using the REUSE instruction.",
        "Only inside recursive loops."
      ],
      correctIndex: 1,
      explanation: "Yes! A CTE is a named temporary result set. Once defined after the 'WITH' keyword, you can query and join it multiple times, keeping logic clean and highly index-friendly."
    },
    {
      id: "Q2",
      question: "How are unconnected lookups in Informatica handled programmatically with high performance in SQL?",
      options: [
        "By writing recursive cursor operations.",
        "By leveraging modern Common Table Expressions (CTEs) representing lookups, joined vectorized.",
        "Writing row-level triggers.",
        "Calling external bash scripts inside the query loop."
      ],
      correctIndex: 1,
      explanation: "Instead of calling a lookup function repeatedly row-by-row (which is slow), we write lookup sources as Common Table Expressions and perform sets joins (vectorized), achieving orders-of-magnitude faster processing."
    },
    {
      id: "Q3",
      question: "Which SQL keyword initiates a Common Table Expression?",
      options: [
        "WITH",
        "CTE",
        "USING",
        "CREATE TEMP"
      ],
      correctIndex: 0,
      explanation: "CTEs are defined under the 'WITH' keyword syntax at the top of a query."
    }
  ],
  "W4-D1": [
    {
      id: "Q1",
      question: "Which Pandas method provides a quick summary of column names, counts of non-null values, and memory footprints?",
      options: [
        ".summary()",
        ".info()",
        ".describe()",
        ".head()"
      ],
      correctIndex: 1,
      explanation: "`.info()` is the gold standard Pandas method to evaluate data integrity, checking column data types and checking the memory footprint of the DataFrame."
    },
    {
      id: "Q2",
      question: "What primary 2D storage variable does Pandas use to hold labeled tabular axes?",
      options: [
        "Series",
        "DataFrame",
        "Matrix",
        "Tensor"
      ],
      correctIndex: 1,
      explanation: "A DataFrame is a 2-dimensional labeled data structure with columns of potentially different types, perfect for spreadsheet-like operations."
    },
    {
      id: "Q3",
      question: "Python Pandas 'read_csv()' performs which Informatica pipeline equivalent?",
      options: [
        "Source Qualifier of flat file targets",
        "Expression routing logic",
        "Aggregation grouping functions",
        "Dynamic Lookup target cache"
      ],
      correctIndex: 0,
      explanation: "`.read_csv()` acts as the ingestion reader or Source Qualifier, transforming a flat spreadsheet file into memory columns."
    }
  ]
};

// Fill in dynamic quality fallback assessments for every single other day of the 36 days curriculum.
export function getAssessmentForDay(dayId: string): AssessmentQuestion[] {
  if (DATA_ASSESSMENTS[dayId]) {
    return DATA_ASSESSMENTS[dayId];
  }

  // Generate customized high-quality trivia relative to SQL/Python data engineering for fallback
  return [
    {
      id: `${dayId}-Q1`,
      question: "How does code-driven data engineering improve on visual tool layouts (Informatica)?",
      options: [
        "Code-driven pipelines are natively version-controlled with git and offer granular compiler optimization profiles.",
        "Code-driven pipelines completely bypass the need to know database schemas.",
        "Visual platforms are computationally faster because of intermediate binary caches.",
        "Code-driven tools are only intended for batch scripts under 1GB."
      ],
      correctIndex: 0,
      explanation: "Code yields excellent clarity, allowing git code tracking, code review, automated testing, CI/CD pipelines, and deep execution-plan optimization."
    },
    {
      id: `${dayId}-Q2`,
      question: "When replacing source qualifiers with queries, which SQL strategy speeds up join processes?",
      options: [
        "Joining on indexed primary or foreign numeric key columns.",
        "Replacing INNER JOINs with nested inline SELECT operations.",
        "Running multiple independent queries and merging files on disc.",
        "Removing all where filter conditions."
      ],
      correctIndex: 0,
      explanation: "Indexes are database lookup engines. Joining on indexed columns (like keys) allows the engine to jump directly to target matching parameters rather than scanning entire partition sets."
    },
    {
      id: `${dayId}-Q3`,
      question: "Which of the following is an anti-pattern when processing high-volume lakehouse data?",
      options: [
        "Loading millions of records into a single local server variables loop rather than utilizing vectorized DB computations.",
        "Pre-filtering rows early under clean WHERE clause controls.",
        "Documenting physical and logical pipelines in dbt YAML files.",
        "Utilizing Partition keys to limit scan sizes on cloud databases."
      ],
      correctIndex: 0,
      explanation: "Local loop sorting consumes high RAM and CPU. Vectorized database operations let storage engines do what they are best at: computing parallel queries at source."
    }
  ];
}

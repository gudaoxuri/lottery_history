# Lottery Data Fetcher

This project is a lottery data fetching application that extracts lottery draw data from [500.com](https://datachart.500.com/ssq/history/newinc/history.php), saves it to a `ssq.csv` file, merges existing records to avoid duplicates, checks for errors, and corrects them. It is built using TypeScript and utilizes various libraries for HTTP requests and CSV handling.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [GitHub Actions](#github-actions)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/lottery-data-fetcher.git
   cd lottery-data-fetcher
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Ensure you have TypeScript installed globally:
   ```
   npm install -g typescript
   ```

## Usage

To run the application and fetch the lottery data, use the following command:
```
npm start
```

This will execute the TypeScript application, which will fetch the latest lottery data, merge it with existing records, and save it to `ssq.csv`.

## Project Structure

```
lottery-data-fetcher
├── src
│   ├── index.ts          # Entry point of the application
│   ├── fetcher.ts        # Fetches lottery data from the web
│   ├── parser.ts         # Parses the fetched data
│   ├── storage.ts        # Handles reading and writing CSV files
│   ├── validator.ts      # Validates and corrects data
│   ├── types
│   │   └── index.ts      # TypeScript interfaces for lottery data
│   └── utils
│       └── helpers.ts    # Utility functions
├── .github
│   └── workflows
│       └── daily-update.yml # GitHub Action for daily updates
├── package.json           # NPM configuration
├── tsconfig.json          # TypeScript configuration
├── .gitignore             # Files to ignore in Git
├── ssq.csv                # Output file for lottery data
└── README.md              # Project documentation
```

## GitHub Actions

The project includes a GitHub Action workflow located in `.github/workflows/daily-update.yml` that runs daily. This workflow sets up the environment, installs dependencies, runs the TypeScript application, and commits the updated `ssq.csv` file back to the repository.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
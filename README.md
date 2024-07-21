# Customer Anonymizer

This project contains two applications:
1. `app.ts` - Generates and inserts customer data into the MongoDB database.
2. `sync.ts` - Anonymizes customer data and syncs it to a separate collection.

## Prerequisites

- Node.js (v14 or later)
- MongoDB (already installed and running)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   DB_URI=mongodb://localhost:27017/customer_db?replicaSet=rs0
   ```
   Adjust the URI if your MongoDB is running on a different host or port.

## MongoDB Configuration

To enable replication and use Change Streams, follow these steps to configure MongoDB:

1. Edit the MongoDB configuration file:
   ```bash
   sudo nano /opt/homebrew/etc/mongod.conf
   ```

2. Add or modify the `replication` section:
   ```yaml
   replication:
     replSetName: "rs0"
   ```

3. Save the changes and exit the editor.

4. Restart MongoDB to apply the changes:
   ```bash
   brew services restart mongodb-community
   ```

5. Initialize the Replica Set:
   - Open the MongoDB shell:
     ```bash
     mongo
     ```
   - Run the following commands:
     ```javascript
     rs.initiate()
     rs.status()  // Check the status of the Replica Set
     ```

These steps will enable replication in MongoDB, allowing you to use Change Streams in your application.

## Building the project

To compile the TypeScript files, run:

```
npm run build
```

This will create a `dist` folder with the compiled JavaScript files.

## Running the applications

1. To start the customer data generator:
   ```
   npm run start:app
   ```

2. To start the real-time sync process:
   ```
   npm run start:sync
   ```

3. To perform a full reindex:
   ```
   npm run start:sync:full
   ```

You can run these applications in separate terminal windows to see them working together.

## Code Formatting

To format the code using Prettier, run:

```
npm run format
```
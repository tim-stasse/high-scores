# Architecture

**Overall Approach**

With lots of records you want something highly scalable and highly available. Generally I'll go with cloud native solutions, and use as many serverless offerings as possible.

DynamoDB lends itself well to this as the database of choice, since DynamoDB natively supports cursor pagination and because there is the requirement for infinite-scroll. DynamoDB does however have throughput limits that need to be considered (particularly so because there is a requirement to infinitely scroll over **all** the records).

While DynamoDB is a NoSQL database and is considered schema-less, it does require a schema for the primary key used for each record. For this solution the primary key would be a composite key, consisting of both a partition key (which is used by a hash function to determine the underlying physical partition on disk that will be used to store the record) and sort key (records with the same partition key--the sort key must then be unique--are stored together on the same physical partition on disk), since there is an assumption that scores will need to be sorted, and DynamoDB can only perform sorting on a sort key.

Because of the assumption around needing to sort, and that DynamoDB can only sort records with the same partition key, the partition key is required to be the same for all records. This has a flow on effect of physically limiting the number of records that the system can read and write to the database every second--DynamoDB has a maximum of 3,000 Read Capacity Units (RCU) per second for items up to 4KB, and 1,000 Write Capacity Units (WCU) per second for items up to 1KB, for a single partition--before throttling throughput to the table. This design therefore does not utilise DynamoDB's full potential, and the extent to which it can scale is limited.

That said, the proposed solution would scale well beyond the current requirements--assuming the key assumptions below are correct. With the current rate of games played and the below assumptions, the current throughput to the table would be around ~0.18 RCU/s and ~0.03 WCU/s, so the current rate of games played that the proposed solution would scale to is approximately ~55,000,000 games per week.

If the requirements changed so that there was no need to scroll infinitely over the entire collection of records, e.g. only the high scores of the past month or year (or in some other way that allowed designing the primary key to more efficiently utilise partitions), then physical limits could be circumvented to allow the solution to scale further. With the correct design, throughput could reach the maximum table limit of 40,000 RCU/s and 40,000 WCU/s--rate limits can also be raised upon request--which would allow for approximately ~730,000,000+ games per week.

**Recommended Technologies**

- AWS
  - DynamoDB
  - Lambda
  - API Gateway
- Apollo GraphQL Server
- Serverless Framework

![](architecture.png 'architecture')

**Key Assumptions**

- The rate of reads and writes is proportional to the rate pf games played (20k per week), and is evenly spread and distributed over the duration of the week
- The number of queries to retrieve scores is not significantly more than the rate of games played
  - Specifically no more than 6 times greater than the number of games played, i.e. 120,000 per week
- Queries can be eventually consistent (i.e. there is no requirement for queries to be strongly consistent)
  - Note: With DynamoDB, if queries were required to be strongly consistent, then the rate at which queries can be executed would be halved
- Scores can only be a whole (integer) number
- Records are returned sorted by highest score descending
- Each record in the database will only store the winning players score for that game (not the scores of other players in that game)
- The total size of a single record in the database is less than or equal to 1KB
  - Note this assumption wasn't validated, but would have a significant effect on the number of RCU/s and WCU/s used to perform IO on the table's partition, and would therefore affect throughput and the total number of games that could be played per week. E.g. if a single record was 1MB in size, the total number of games per week that the solution could scale to, would be approximately ~55,000 games per week
- The API is already secure by some other means and is only ever used by trusted clients ¯\\_(ツ)_/¯
  - IRL I would use AWS cognito to authenticate users and pass a JWT token to the server to secure it

# Project Demo

**Prerequisites**

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
- [Node Version Manager](https://github.com/nvm-sh/nvm#installation-and-update)
- [Yarn](https://yarnpkg.com/lang/en/docs/install)

For DynamoDB Local

- [JDK-11](https://www.oracle.com/technetwork/java/javase/downloads/jdk11-downloads-5066655.html)

**Install Dependencies**

- `nvm install`
- `yarn install`

**Running Locally**

- `nvm use`
- `yarn start`

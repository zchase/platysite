# Platysite

A simple CLI for deploying static websites to AWS, Azure, and Google Cloud.

## Examples

### AWS

#### Deploy

`npx platysite deploy dev --cloud="aws" --region="us-west-2" --sitePath="./build"`

#### Destroy

`npx platysite destroy dev`

### Azure

#### Deploy

`npx platysite deploy dev --cloud="azure" --region="eastus" --sitePath="./build"`

#### Destroy

`npx platysite destroy dev`

### Google Cloud

#### Deploy

`npx platysite deploy dev --cloud="google" --googleCloudProjectId="project-id" --sitePath="./build"`

#### Destroy

`npx platysite destroy dev`

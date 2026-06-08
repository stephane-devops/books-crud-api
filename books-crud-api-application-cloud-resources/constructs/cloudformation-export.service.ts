// cloudformation-export.service.ts
import {
    CloudFormationClient,
    ListExportsCommand,
} from "@aws-sdk/client-cloudformation";

export class CloudFormationExportService {
    private  client:CloudFormationClient;
    constructor(region: string) {
        this.client = new CloudFormationClient({ region });
    }

    async getExportValue(exportName: string): Promise<string | null> {
        let nextToken: string | undefined;

        do {
            const response = await this.client.send(
                new ListExportsCommand({
                    NextToken: nextToken,
                })
            );

            const found = response.Exports?.find(
                (exp) => exp.Name === exportName
            );

            if (found?.Value) {
                return found.Value;
            }

            nextToken = response.NextToken;
        } while (nextToken);

        return null;
    }

    async getRequiredExportValue(exportName: string): Promise<string> {
        const value = await this.getExportValue(exportName,);

        if (!value) {
            throw new Error(`CloudFormation export not found: ${exportName}`);
        }

        return value;
    }
}



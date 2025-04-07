import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, ValidateNested, IsOptional, IsObject, IsArray, ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsBoolean, IsUUID } from "class-validator";

export class GetByExpressionDTOcurriculum {

    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    public searchExpression: string;
}

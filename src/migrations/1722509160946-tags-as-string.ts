import { MigrationInterface, QueryRunner } from "typeorm";

export class TagsAsString1722509160946 implements MigrationInterface {
  name = "TagsAsString1722509160946";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "tags"`);
    await queryRunner.query(`ALTER TABLE "notes" ADD "tags" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "notes" ADD "tags" character varying array`
    );
  }
}

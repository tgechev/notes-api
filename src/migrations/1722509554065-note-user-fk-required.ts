import { MigrationInterface, QueryRunner } from "typeorm";

export class NoteUserFkRequired1722509554065 implements MigrationInterface {
  name = "NoteUserFkRequired1722509554065";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_829532ff766505ad7c71592c6a5"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ALTER COLUMN "userId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_829532ff766505ad7c71592c6a5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_829532ff766505ad7c71592c6a5"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ALTER COLUMN "userId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_829532ff766505ad7c71592c6a5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}

import { DefaultShim } from '../../../powershell/shim/DefaultShim';
import { ShimOptions } from '../../../powershell/shim/Shim';

describe('DefaultShim', () => {
  const shim = new DefaultShim();
  const dummyOptions: ShimOptions = {
    expandParameters: true,
    resultSerializationDepth: 2,
  };

  test('requests correct streams', () => {
    expect(shim.requiresStdout).toBeTruthy();
    expect(shim.requiresStderr).toBeFalsy();
  });

  describe('prepare', () => {
    test('command is included in prepared shim', () => {
      expect(shim.prepare('a', 'Write-Host "Hello, World!"', {}, dummyOptions)).toMatch(/(Write-Host "Hello, World!")/);
    });
  });

  describe('parseResult', () => {
    test('parses result data', () => {
      expect(
        shim.parseResult(
          'id',
          '{{id=eyJzdWNjZXNzIjp0cnVlLCAiZGF0YSI6IFt7ICJmaXJzdE5hbWUiOiJQZXRlciIsICJsYXN0TmFtZSI6IlBhcmtlciIgfV19}}',
        ),
      ).toEqual({
        data: [
          {
            firstName: 'Peter',
            lastName: 'Parker',
          },
        ],
      });
    });

    test('parses expeption thrown in powershell', () => {
      expect(
        shim.parseResult(
          'id',
          '{{id=eyJzdWNjZXNzIjpmYWxzZSwgImRhdGEiOiBbeyAiRXhjZXB0aW9uIjoiZHVtbXlleCIsICJGdWxseVF1YWxpZmllZEVycm9ySWQiOiJkdW1teWlkIiwgIkludm9jYXRpb25JbmZvIjogImR1bW15aWkiIH1dfQ==}}',
        ),
      ).toEqual({
        error: {
          Exception: 'dummyex',
          FullyQualifiedErrorId: 'dummyid',
          InvocationInfo: 'dummyii',
        },
      });
    });

    test('throws Error with malformed id', () => {
      expect(() => shim.parseResult('a', '{{id=zIjp0zIjp0zIjp0}}')).toThrow(Error);
    });

    test('throws Error with malformed data', () => {
      expect(() => shim.parseResult('id', '{{id=zIjp0zIjp0zIjp0}}')).toThrow(Error);
    });
  });
});

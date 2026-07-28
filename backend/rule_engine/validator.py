import yaml
from jsonpath_ng import parse
from jsonschema import validate, ValidationError
from typing import List, Dict, Any

class RuleEngine:
    def __init__(self, rules_path: str):
        with open(rules_path) as f:
            self.rules = yaml.safe_load(f)['rules']

    def validate_spec(self, spec: Dict) -> List[Dict]:
        violations = []
        for rule in self.rules:
            try:
                if 'json_path' in rule:
                    matches = [m.value for m in parse(rule['json_path']).find(spec)]
                    if not matches:
                        violations.append({
                            'rule_id': rule['id'],
                            'message': rule['description'],
                            'severity': rule['severity'],
                            'path': rule['json_path']
                        })
                elif 'schema' in rule:
                    validate(instance=spec, schema=rule['schema'])
            except ValidationError as e:
                violations.append({
                    'rule_id': rule['id'],
                    'message': f"Schema validation failed: {e.message}",
                    'severity': rule['severity'],
                    'path': e.json_path
                })
        return violations
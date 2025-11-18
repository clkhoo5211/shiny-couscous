# Test Documentation

This directory contains all test-related documentation and reports for the Labuan FSA E-Submission System.

## Test Documentation Files

### Test Plans
- **FULL_FLOW_TEST_PLAN.md** - Comprehensive test plan covering user and admin flows

### Test Results
- **FULL_FLOW_TEST_RESULTS.md** - Results from full flow testing (user and admin workflows)
- **BROWSER_TEST_RESULTS.md** - Browser-based testing results
- **COMPREHENSIVE_TEST_RESULTS.md** - Comprehensive test results with detailed analysis
- **COMPREHENSIVE_TEST_REPORT.md** - Detailed test report with findings
- **TEST_SUMMARY.md** - Summary of API test results

## Test Scripts

Test scripts and related files are located in the `tests/` directory at the project root:
- `test_all_apis.py` - Automated API testing script
- `test_results.json` - JSON output from API tests
- `test-upload.*` - File upload test files

## Running Tests

### API Tests
```bash
cd tests
python test_all_apis.py
```

### Manual Testing
Refer to the test plans in this directory for manual testing procedures.

## Test Coverage

- ✅ User registration and authentication
- ✅ Form submission workflows
- ✅ Draft saving and editing
- ✅ Admin review processes
- ✅ File upload functionality
- ✅ API endpoint testing
- ✅ Browser compatibility testing


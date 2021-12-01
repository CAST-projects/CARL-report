let templatetitle = 'PCI-DSS 3.2.1 Summary Report';
let templateheaders = ["Category Name","Issues Found"];
let templatetags = [
      {"id":"PCI-Requirement-1.3.8","name":"PCI-Requirement-1.3.8 - Do not disclose private IP addresses and routing information to unauthorized parties.","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-2.2.4","name":"PCI-Requirement-2.2.4 - Configure system security parameters to prevent misuse.","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-3.6.1","name":"PCI-Requirement-3.6.1 - Generation of Strong Cryptographic Keys","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-4.1","name":"PCI-Requirement-4.1 - Use Strong Cryptography and Security Protocols","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-6.3.1","name":"PCI-Requirement-6.3.1 - Remove development, test and/or custom application accounts, user IDs, and passwords before applications become active or are released to customers.","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-6.5.1","name":"PCI-Requirement-6.5.1 - Injection flaws, particularly SQL injection. Also consider OS Command Injection, LDAP and XPath injection flaws as well as other injection flaws.","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-6.5.2","name":"PCI-Requirement-6.5.2 - Buffer overflows","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-6.5.4","name":"PCI-Requirement-6.5.4 - Insecure communications","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-6.5.5","name":"PCI-Requirement-6.5.5 - Improper error handling","nbviolation":"0","applicable":"1"},
      {"id":"PCI-Requirement-6.5.7","name":"PCI-Requirement-6.5.7 - Cross-site scripting (XSS)","nbviolation":"0","applicable":"0"},
      {"id":"PCI-Requirement-6.5.8","name":"PCI-Requirement-6.5.8 - Improper access control (such as insecure direct object references, failure to restrict URL access, directory traversal, and failure to restrict user access to functions).","nbviolation":"0","applicable":"0"},
      {"id":"PCI-Requirement-6.5.9","name":"PCI-Requirement-6.5.9 - Cross-site request forgery (CSRF)","nbviolation":"0","applicable":"0"},
      {"id":"PCI-Requirement-6.5.10","name":"PCI-Requirement-6.5.10 - Broken authentication and session management","nbviolation":"0","applicable":"0"},
      {"id":"PCI-Requirement-8.2.1","name":"PCI-Requirement-8.2.1 - Using strong cryptography, render all authentication credentials (such as passwords/phrases) unreadable during transmission and storage on all system components.","nbviolation":"0","applicable":"0"}
    ];

module.exports = {templatetitle: templatetitle, templateheaders: templateheaders, templatetags:templatetags}

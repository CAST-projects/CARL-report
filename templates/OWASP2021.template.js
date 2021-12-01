let templatetitle = 'OWASP 2021 Summary Report';
let templateheaders = ["Category Name","Issues Found"];
let templatetags = [
      {"id":"A01-2021","name":"A01 2021 - Broken Access Control","nbviolation":"0","applicable":"1"},
      {"id":"A02-2021","name":"A02 2021 - Cryptographic Failures","nbviolation":"0","applicable":"1"},
      {"id":"A03-2021","name":"A03 2021 - Injection","nbviolation":"0","applicable":"1"},
      {"id":"A04-2021","name":"A04 2021 - Insecure Design","nbviolation":"0","applicable":"1"},
      {"id":"A05-2021","name":"A05 2021 - Security Misconfiguration","nbviolation":"0","applicable":"1"},
      {"id":"A06-2021","name":"A06 2021 - Vulnerable and Outdated Components","nbviolation":"0","applicable":"1"},
      {"id":"A07-2021","name":"A07 2021 - Identification and Authentication Failures","nbviolation":"0","applicable":"1"},
      {"id":"A08-2021","name":"A08 2021 - Software and Data Integrity Failures","nbviolation":"0","applicable":"1"},
      {"id":"A09-2021","name":"A09 2021 - Security Logging and Monitoring Failures","nbviolation":"0","applicable":"1"},
      {"id":"A10-2021","name":"A10 2021 - Server-Side Request Forgery (SSRF)","nbviolation":"0","applicable":"1"}];

let templatedescriptions = [
  {"id":"A01-2021","description":"Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits."},
  {"id":"A02-2021","description":"The first thing is to determine the protection needs of data in transit and at rest. For example, passwords, credit card numbers, health records, personal information, and business secrets require extra protection, mainly if that data falls under privacy laws, e.g., EU's General Data Protection Regulation (GDPR), or regulations, e.g., financial data protection such as PCI Data Security Standard (PCI DSS)."},
  {"id":"A03-2021","description":"Some of the more common injections are SQL, NoSQL, OS command, Object Relational Mapping (ORM), LDAP, and Expression Language (EL) or Object Graph Navigation Library (OGNL) injection."},
  {"id":"A04-2021","description":"Insecure design is a broad category representing different weaknesses, expressed as missing or ineffective control design."},
  {"id":"A05-2021","description":"Security misconfiguration is the most commonly seen issue. This is commonly a result of insecure default configurations, incomplete or ad hoc configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages containing sensitive information. Not only must all operating systems, frameworks, libraries, and applications be securely configured, but they must be patched/upgraded in a timely fashion."},
  {"id":"A06-2021","description":"Components, such as libraries, frameworks, and other software modules, run with the same privileges as the application. If a vulnerable component is exploited, such an attack can facilitate serious data loss or server takeover. Applications and APIs using components with known vulnerabilities may undermine application defenses and enable various attacks and impacts."},
  {"id":"A07-2021","description":"Confirmation of the user's identity, authentication, and session management is critical to protect against authentication-related attacks."},
  {"id":"A08-2021","description":"Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations."},
  {"id":"A09-2021","description":"This category is to help detect, escalate, and respond to active breaches. Without logging and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and active response occurs any time."},
  {"id":"A10-2021","description":"SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall, VPN, or another type of network access control list (ACL)."},

];

module.exports = {templatetitle: templatetitle, templateheaders: templateheaders, templatetags:templatetags, templatedescriptions:templatedescriptions}

let templatetitle = 'OWASP 2013 Summary Report';
let templateheaders = ["Category Name","Exploitability","Weakness Prevalence","Weakness Detectability","Technical Impact","Issues Found"];
let templatetags = [
      {"id":"A1-2013","name":"A1 2013 - Injection","nbviolation":"0","custom":[{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Common","backgroundColor":"#FDD796"},{"title":"Average","backgroundColor":"#FCA28E"},{"title":"Severe","backgroundColor":"#FCA28E"}],"applicable":"1"},
      {"id":"A2-2013","name":"A2 2013 - Broken Authentication and Session Management","nbviolation":"0","custom":[{"title":"Average","backgroundColor":"#FDD796"},{"title":"Widespread","backgroundColor":"#FCA28E"},{"title":"Average","backgroundColor":"#FDD796"},{"title":"Severe","backgroundColor":"#FCA28E"}],"applicable":"1"},
      {"id":"A3-2013","name":"A3 2013 - Cross-Site Scripting (XSS)","nbviolation":"0","custom":[{"title":"Average","backgroundColor":"#FDD796"},{"title":"Very Widespread","backgroundColor":"#FF0000"},{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Moderate","backgroundColor":"#FDD796"}],"applicable":"1"},
      {"id":"A4-2013","name":"A4 2013 - Insecure Direct Object References","nbviolation":"0","custom":[{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Common","backgroundColor":"#FDD796"},{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Moderate","backgroundColor":"#FDD796"}],"applicable":"1"},
      {"id":"A5-2013","name":"A5 2013 - Security Misconfiguration","nbviolation":"0","custom":[{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Common","backgroundColor":"#FDD796"},{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Moderate","backgroundColor":"#FDD796"}],"applicable":"1"},
      {"id":"A6-2013","name":"A6 2013 - Sensitive Data Exposure","nbviolation":"0","custom":[{"title":"Difficult","backgroundColor":"#FEFCA2"},{"title":"Uncommon","backgroundColor":"#FEFCA2"},{"title":"Average","backgroundColor":"#FDD796"},{"title":"Severe","backgroundColor":"#FCA28E"}],"applicable":"1"},
      {"id":"A7-2013","name":"A7 2013 - Missing Function Level Access Control","custom":[{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Common","backgroundColor":"#FDD796"},{"title":"Average","backgroundColor":"#FDD796"},{"title":"Moderate","backgroundColor":"#FDD796"}],"nbviolation":"0","applicable":"1"},
      {"id":"A8-2013","name":"A8 2013 - Cross-Site Request Forgery (CSRF)","custom":[{"title":"Average","backgroundColor":"#FDD796"},{"title":"Common","backgroundColor":"#FDD796"},{"title":"Easy","backgroundColor":"#FCA28E"},{"title":"Moderate","backgroundColor":"#FDD796"}],"nbviolation":"0","applicable":"1"},
      {"id":"A9-2013","name":"A9 2013 - Using Components With Known Vulnerabilities","custom":[{"title":"Average","backgroundColor":"#FDD796"},{"title":"Widespread","backgroundColor":"#FCA28E"},{"title":"Difficult","backgroundColor":"#FEFCA2"},{"title":"Moderate","backgroundColor":"#FDD796"}],"nbviolation":"0","applicable":"1"},
      {"id":"A10-2013","name":"A10 2013 - Unvalidated Redirects and Forwards","custom":[{"title":"Average","backgroundColor":"#FDD796"},{"title":"Widespread","backgroundColor":"#FCA28E"},{"title":"Difficult","backgroundColor":"#FEFCA2"},{"title":"Moderate","backgroundColor":"#FDD796"}],"nbviolation":"0","applicable":"1"}];


let templatedescriptions = [
        {"id":"A1-2013","description":"This category of rules primarily deals with issues such as - Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization."},
        {"id":"A2-2013","description":"Application functions related to authentication and session management are often not implemented correctly, allowing attackers to compromise passwords, keys, or session tokens, or to exploit other implementation flaws to assume other users’ identities."},
        {"id":"A3-2013","description":"XSS flaws occur whenever an application takes untrusted data and sends it to a web browser without proper validation or escaping. XSS allows attackers to execute scripts in the victim’s browser which can hijack user sessions, deface web sites, or redirect the user to malicious sites."},
        {"id":"A4-2013","description":"A direct object reference occurs when a developer exposes a reference to an internal implementation object, such as a file, directory, or database key. Without an access control check or other protection, attackers can manipulate these references to access unauthorized data."},
        {"id":"A5-2013","description":"Good security requires having a secure configuration defined and deployed for the application, frameworks, application server, web server, database server, and platform. Secure settings should be defined, implemented, and maintained, as defaults are often insecure. Additionally, software should be kept up to date."},
        {"id":"A6-2013","description":"Many web applications do not properly protect sensitive data, such as credit cards, tax IDs, and authentication credentials. Attackers may steal or modify such weakly protected data to conduct credit card fraud, identity theft, or other crimes. Sensitive data deserves extra protection such as encryption at rest or in transit, as well as special precautions when exchanged with the browser."},
        {"id":"A7-2013","description":"Most web applications verify function level access rights before making that functionality visible in the UI. However, applications need to perform the same access control checks on the server when each function is accessed. If requests are not verified, attackers will be able to forge requests in order to access functionality without proper authorization."},
        {"id":"A8-2013","description":"A CSRF attack forces a logged-on victim’s browser to send a forged HTTP request, including the victim’s session cookie and any other automatically included authentication information, to a vulnerable web application. This allows the attacker to force the victim’s browser to generate requests the vulnerable application thinks are legitimate requests from the victim."},
        {"id":"A9-2013","description":"Components, such as libraries, frameworks, and other software modules, run with the same privileges as the application. If a vulnerable component is exploited, such an attack can facilitate serious data loss or server takeover. Applications and APIs using components with known vulnerabilities may undermine application defenses and enable various attacks and impacts."},
        {"id":"A10-2013","description":"Web applications frequently redirect and forward users to other pages and websites and use untrusted data to determine the destination pages. Without proper validation, attackers can redirect victims to phishing or malware sites, or use forwards to access unauthorized pages."},

      ];

module.exports = {templatetitle: templatetitle, templatetags:templatetags, templateheaders:templateheaders, templatedescriptions:templatedescriptions}

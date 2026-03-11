import OutCall "http-outcalls/outcall";
import Text "mo:core/Text";
import Array "mo:core/Array";

actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func checkText(text : Text, language : Text) : async Text {
    let url = "https://api.languagetool.org/v2/check";
    let headers = Array.repeat(
      {
        name = "Content-Type";
        value = "application/x-www-form-urlencoded";
      },
      1,
    );
    let body = "text=" # text # "&language=" # language;
    await OutCall.httpPostRequest(url, headers, body, transform);
  };
};

import { imageGenerateHF, imageEditHF } from "./huggingface";

export async function imageGenerate(args: any) {
  switch (args.provider) {
    case "huggingface":
      return imageGenerateHF(args);
    case "fal":
    case "replicate":
    case "stability":
    case "heartsync":
        throw new Error(`Provider ${args.provider} not yet implemented in sandbox.`);
    default:
      throw new Error("unsupported_provider");
  }
}

export async function imageEdit(args: any) {
    switch (args.provider) {
        case "huggingface":
            return imageEditHF(args);
        case "fal":
        case "replicate":
        case "stability":
        case "heartsync":
            throw new Error(`Provider ${args.provider} edit not yet implemented in sandbox.`);
        default:
            throw new Error("unsupported_provider");
    }
}

import { ccc } from "@ckb-ccc/connector-react";

/**
 * A resolved did:ckb identity owned by the connected lock.
 */
export type DidProfile = {
    /** `did:ckb:` identifier. */
    did: string;
    /** Type script args of the DID Metadata Cell. */
    id: ccc.Hex;
    /** The decoded DID document, as stored in the cell. */
    document: unknown;
    /** `did:plc:` source when this DID was migrated. */
    localId?: string;
    /** `services.profile.displayName`, when the document carries a profile. */
    displayName?: string;
    /** `services.profile.avatar`, when the document carries a profile. */
    avatar?: string;
    /** `services.profile.bio`, when the document carries a profile. */
    bio?: string;
    /** `alsoKnownAs` handles from the document. */
    alsoKnownAs: string[];
};

export type DidResolverContext = {
    client: ccc.Client;
    signer: ccc.Signer;
    lock: ccc.Script;
    address: string;
};

export type DidResolver = (context: DidResolverContext) => Promise<DidProfile[]>;

export type DidScript = { codeHash: ccc.HexLike; hashType: ccc.HashTypeLike };

/** did:ckb type script deployments known to the kit. */
export const DID_CKB_SCRIPTS: Record<"mainnet" | "testnet", DidScript> = {
    mainnet: {
        codeHash: "0x4a06164dc34dccade5afe3e847a97b6db743e79f5477fa3295acf02849c5984a",
        hashType: "type",
    },
    testnet: {
        codeHash: "0x510150477b10d6ab551a509b71265f3164e9fd4137fcb5a4322f49f03092c7c5",
        hashType: "type",
    },
};

const DID_PREFIX = "did:ckb:";
const BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

function base32Encode(bytes: Uint8Array): string {
    let bits = 0;
    let value = 0;
    let output = "";
    for (let i = 0; i < bytes.length; i++) {
        value = (value << 8) | bytes[i];
        bits += 8;
        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }
    return output;
}

/** Convert DID Metadata Cell type args to a `did:ckb:` identifier. */
export function argsToDid(args: ccc.HexLike): string {
    return DID_PREFIX + base32Encode(ccc.bytesFrom(args));
}

const DidCkbDataCodec = ccc.mol.union({
    v1: ccc.mol.table({
        document: ccc.mol.Bytes,
        localId: ccc.mol.StringOpt,
    }),
});

// Minimal CBOR reader. DID documents are maps, arrays, strings, numbers,
// booleans, and null, so this covers the major types the document can use.
function decodeCbor(bytes: Uint8Array): unknown {
    let offset = 0;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const textDecoder = new TextDecoder();

    function readLength(info: number): number {
        if (info < 24) return info;
        if (info === 24) return bytes[offset++];
        if (info === 25) {
            const v = view.getUint16(offset);
            offset += 2;
            return v;
        }
        if (info === 26) {
            const v = view.getUint32(offset);
            offset += 4;
            return v;
        }
        if (info === 27) {
            const v = Number(view.getBigUint64(offset));
            offset += 8;
            return v;
        }
        throw new Error(`Unsupported CBOR length ${info}`);
    }

    function readItem(): unknown {
        const initial = bytes[offset++];
        const major = initial >> 5;
        const info = initial & 0x1f;

        switch (major) {
            case 0:
                return readLength(info);
            case 1:
                return -1 - readLength(info);
            case 2: {
                const length = readLength(info);
                const slice = bytes.slice(offset, offset + length);
                offset += length;
                return slice;
            }
            case 3: {
                const length = readLength(info);
                const text = textDecoder.decode(bytes.subarray(offset, offset + length));
                offset += length;
                return text;
            }
            case 4: {
                const length = readLength(info);
                const items: unknown[] = [];
                for (let i = 0; i < length; i++) items.push(readItem());
                return items;
            }
            case 5: {
                const length = readLength(info);
                const map: Record<string, unknown> = {};
                for (let i = 0; i < length; i++) {
                    const key = readItem();
                    map[typeof key === "string" ? key : String(key)] = readItem();
                }
                return map;
            }
            case 6: {
                readLength(info);
                return readItem();
            }
            case 7: {
                if (info === 20) return false;
                if (info === 21) return true;
                if (info === 22 || info === 23) return null;
                if (info === 25) {
                    const half = view.getUint16(offset);
                    offset += 2;
                    const sign = half & 0x8000 ? -1 : 1;
                    const exponent = (half >> 10) & 0x1f;
                    const fraction = half & 0x3ff;
                    if (exponent === 0) return sign * fraction * 2 ** -24;
                    if (exponent === 31) return fraction ? NaN : sign * Infinity;
                    return sign * (1 + fraction / 1024) * 2 ** (exponent - 15);
                }
                if (info === 26) {
                    const v = view.getFloat32(offset);
                    offset += 4;
                    return v;
                }
                if (info === 27) {
                    const v = view.getFloat64(offset);
                    offset += 8;
                    return v;
                }
                throw new Error(`Unsupported CBOR simple value ${info}`);
            }
            default:
                throw new Error(`Unsupported CBOR major type ${major}`);
        }
    }

    return readItem();
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Read the display fields from a decoded DID document. The profile lives at
 * `services.profile` with `displayName`, `avatar`, and `bio`.
 */
export function extractDidProfile(document: unknown): Pick<DidProfile, "displayName" | "avatar" | "bio" | "alsoKnownAs"> {
    const doc = asRecord(document) ?? {};
    const services = asRecord(doc.services) ?? {};
    const profile = asRecord(services.profile) ?? asRecord(doc.profile) ?? {};
    const alsoKnownAs = Array.isArray(doc.alsoKnownAs)
        ? doc.alsoKnownAs.filter((item): item is string => typeof item === "string")
        : [];

    return {
        displayName: asString(profile.displayName) ?? asString(profile.name),
        avatar: asString(profile.avatar) ?? asString(profile.image),
        bio: asString(profile.bio) ?? asString(profile.description),
        alsoKnownAs,
    };
}

/** Decode the data of a DID Metadata Cell into a DidProfile. */
export function decodeDidCell(cell: ccc.Cell): DidProfile | undefined {
    const type = cell.cellOutput.type;
    if (!type) return undefined;

    const decoded = DidCkbDataCodec.decode(cell.outputData) as {
        type: string;
        value: { document: ccc.Hex; localId?: string | null };
    };
    if (decoded.type !== "v1") return undefined;

    const document = decodeCbor(ccc.bytesFrom(decoded.value.document));
    const id = ccc.hexFrom(type.args);

    return {
        did: argsToDid(id),
        id,
        document,
        localId: decoded.value.localId ?? undefined,
        ...extractDidProfile(document),
    };
}

async function didScriptFor(client: ccc.Client, override?: DidScript): Promise<DidScript> {
    if (override) return override;

    const known = (ccc.KnownScript as Record<string, string>).DidCkb;
    if (known) {
        try {
            const info = await client.getKnownScript(known as ccc.KnownScript);
            return { codeHash: info.codeHash, hashType: info.hashType };
        } catch {
            // Fall through to the bundled deployments.
        }
    }

    return client.addressPrefix === "ckb" ? DID_CKB_SCRIPTS.mainnet : DID_CKB_SCRIPTS.testnet;
}

/**
 * List the live did:ckb cells owned by a lock, newest first.
 */
export async function listDidsByLock(props: {
    client: ccc.Client;
    lock: ccc.ScriptLike;
    script?: DidScript;
    limit?: number;
}): Promise<DidProfile[]> {
    const script = await didScriptFor(props.client, props.script);
    const profiles: DidProfile[] = [];

    for await (const cell of props.client.findCells(
        {
            script: ccc.Script.from(props.lock),
            scriptType: "lock",
            scriptSearchMode: "exact",
            filter: {
                script: ccc.Script.from({
                    codeHash: script.codeHash,
                    hashType: script.hashType,
                    args: "0x",
                }),
            },
            withData: true,
        },
        "desc",
        props.limit ?? 20,
    )) {
        try {
            const profile = decodeDidCell(cell);
            if (profile) profiles.push(profile);
        } catch {
            // Skip cells the kit cannot decode.
        }
    }

    return profiles;
}

/** Default resolver: the DIDs owned by the connected wallet's lock. */
export function createDidResolver(options: { script?: DidScript; limit?: number } = {}): DidResolver {
    return ({ client, lock }) => listDidsByLock({ client, lock, script: options.script, limit: options.limit });
}

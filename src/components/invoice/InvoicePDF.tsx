import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Profile, InvoiceFormData } from "../../types";

// Helvetica est intégré dans @react-pdf/renderer, pas besoin de l'enregistrer.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  logo: {
    maxHeight: 50,
    objectFit: "contain" as const,
    alignSelf: "center" as const,
    marginBottom: 12,
  },
  headerBanner: {
    backgroundColor: "#d1d5db",
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#9ca3af",
    alignItems: "center" as const,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 4,
    textTransform: "uppercase" as const,
  },
  infoRow: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 16,
  },
  emitterBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
  },
  clientBox: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 10,
  },
  emitterName: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 4,
  },
  clientName: {
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center" as const,
  },
  clientAddr: {
    textAlign: "center" as const,
    marginTop: 2,
  },
  datesBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    marginBottom: 16,
  },
  dateLine: {
    marginBottom: 2,
  },
  dateLabel: {
    fontWeight: "bold",
  },
  table: {
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: "row" as const,
    backgroundColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row" as const,
  },
  cellQty: {
    width: 50,
    borderWidth: 0.5,
    borderColor: "#9ca3af",
    padding: 4,
    textAlign: "center" as const,
  },
  cellDesignation: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#9ca3af",
    padding: 4,
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
  },
  cellUnitPrice: {
    width: 85,
    borderWidth: 0.5,
    borderColor: "#9ca3af",
    padding: 4,
    textAlign: "right" as const,
  },
  cellTotalPrice: {
    width: 85,
    borderWidth: 0.5,
    borderColor: "#9ca3af",
    padding: 4,
    textAlign: "right" as const,
  },
  headerCellText: {
    fontWeight: "bold",
    fontSize: 8.5,
  },
  totalRow: {
    flexDirection: "row" as const,
    borderTopWidth: 1,
    borderColor: "#9ca3af",
  },
  totalLabel: {
    fontWeight: "bold",
    textAlign: "right" as const,
  },
  totalValue: {
    fontWeight: "bold",
    textAlign: "right" as const,
  },
  iban: {
    textAlign: "center" as const,
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  signature: {
    maxHeight: 50,
    objectFit: "contain" as const,
    alignSelf: "flex-end" as const,
    marginBottom: 12,
  },
  legalText: {
    fontSize: 7.5,
    color: "#6b7280",
    lineHeight: 1.4,
    marginTop: 8,
  },
});

function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " \u20AC"
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const MIN_TABLE_ROWS = 10;

interface InvoicePDFProps {
  profile: Profile;
  form: InvoiceFormData;
}

export default function InvoicePDF({ profile, form }: InvoicePDFProps) {
  const filledItems = form.items.filter((item) => item.designation.trim());
  const totalHt = filledItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_ht,
    0
  );
  const emptyRowsCount = Math.max(0, MIN_TABLE_ROWS - filledItems.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        {profile.logo_base64 && (
          <Image src={profile.logo_base64} style={styles.logo} />
        )}

        {/* Header banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerText}>
            F A C T U R E N°{form.invoice_number}
          </Text>
        </View>

        {/* Emitter + Client */}
        <View style={styles.infoRow}>
          <View style={styles.emitterBox}>
            <Text style={styles.emitterName}>{profile.owner_name}</Text>
            <Text style={{ marginTop: 4 }}>{profile.address}</Text>
            <Text>
              {profile.postal_code} {profile.city}
            </Text>
            {profile.phone ? (
              <Text style={{ marginTop: 4 }}>
                {"\u260E"} {profile.phone}
              </Text>
            ) : null}
            {profile.rcs ? <Text>{profile.rcs}</Text> : null}
            {profile.siret ? <Text>SIRET: {profile.siret}</Text> : null}
          </View>
          <View style={styles.clientBox}>
            <Text style={styles.clientName}>{form.client_name}</Text>
            <Text style={styles.clientAddr}>{form.client_address}</Text>
            <Text style={styles.clientAddr}>
              {form.client_postal_code} {form.client_city}
            </Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesBox}>
          <Text style={styles.dateLine}>
            <Text style={styles.dateLabel}>Date de facture : </Text>
            {formatDate(form.invoice_date)}
          </Text>
          <Text style={styles.dateLine}>
            <Text style={styles.dateLabel}>Date de livraison : </Text>
            {formatDate(form.delivery_date)}
          </Text>
          <Text style={styles.dateLine}>
            <Text style={styles.dateLabel}>Échéance de paiement : </Text>
            {formatDate(form.payment_due_date)}
          </Text>
          <Text style={styles.dateLine}>
            <Text style={styles.dateLabel}>Condition d'escompte : </Text>
            {form.discount_conditions}
          </Text>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.cellQty}>
              <Text style={styles.headerCellText}>Quantité</Text>
            </View>
            <View style={styles.cellDesignation}>
              <Text style={styles.headerCellText}>Désignation</Text>
            </View>
            <View style={styles.cellUnitPrice}>
              <Text style={styles.headerCellText}>Prix unitaire HT</Text>
            </View>
            <View style={styles.cellTotalPrice}>
              <Text style={styles.headerCellText}>Prix total HT</Text>
            </View>
          </View>

          {/* Filled rows */}
          {filledItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.cellQty}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={styles.cellDesignation}>
                <Text>{item.designation.toUpperCase()}</Text>
              </View>
              <View style={styles.cellUnitPrice}>
                <Text>{formatCurrency(item.unit_price_ht)}</Text>
              </View>
              <View style={styles.cellTotalPrice}>
                <Text>
                  {formatCurrency(item.quantity * item.unit_price_ht)}
                </Text>
              </View>
            </View>
          ))}

          {/* Empty rows */}
          {Array.from({ length: emptyRowsCount }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.tableRow}>
              <View style={styles.cellQty}>
                <Text> </Text>
              </View>
              <View style={styles.cellDesignation}>
                <Text> </Text>
              </View>
              <View style={styles.cellUnitPrice}>
                <Text> </Text>
              </View>
              <View style={styles.cellTotalPrice}>
                <Text>
                  {i === 0 && filledItems.length > 0
                    ? formatCurrency(0)
                    : " "}
                </Text>
              </View>
            </View>
          ))}

          {/* Total row */}
          <View style={styles.totalRow}>
            <View style={[styles.cellQty, { borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.cellDesignation, { borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.cellUnitPrice, { borderTopWidth: 1 }]}>
              <Text style={styles.totalLabel}>Total HT</Text>
            </View>
            <View style={[styles.cellTotalPrice, { borderTopWidth: 1 }]}>
              <Text style={styles.totalValue}>{formatCurrency(totalHt)}</Text>
            </View>
          </View>
        </View>

        {/* IBAN */}
        {profile.iban ? (
          <Text style={styles.iban}>IBAN /{profile.iban}</Text>
        ) : null}

        {/* Signature */}
        {profile.signature_base64 && (
          <Image src={profile.signature_base64} style={styles.signature} />
        )}

        {/* Legal mentions */}
        {profile.legal_mentions ? (
          <Text style={styles.legalText}>{profile.legal_mentions}</Text>
        ) : null}
      </Page>
    </Document>
  );
}

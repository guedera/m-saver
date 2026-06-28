from app.models.conta import Conta
from app.models.operacao import TipoOperacao


def aplicar_operacao(conta: Conta, tipo: TipoOperacao, valor: float) -> None:
    """Atualiza saldo_atual da conta de acordo com o tipo da operação."""
    if tipo == TipoOperacao.gasto:
        conta.saldo_atual = float(conta.saldo_atual) - valor
    else:
        conta.saldo_atual = float(conta.saldo_atual) + valor


def reverter_operacao(conta: Conta, tipo: TipoOperacao, valor: float) -> None:
    """Desfaz o efeito de uma operação no saldo — usado em edição e exclusão."""
    if tipo == TipoOperacao.gasto:
        conta.saldo_atual = float(conta.saldo_atual) + valor
    else:
        conta.saldo_atual = float(conta.saldo_atual) - valor
